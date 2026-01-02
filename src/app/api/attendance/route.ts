import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch Today's Log
        const todayLog = await Attendance.findOne({
            userId: session.user.id,
            date: { $gte: today }
        });

        // Common history logic
        // STRICT: Only show OWN history on the personal attendance page, regardless of role
        const historyQuery = { userId: session.user.id };

        const history = await Attendance.find(historyQuery)
            .populate('userId', 'firstName lastName department')
            .sort({ date: -1 })
            .limit(30);

        return NextResponse.json({
            todayLog,
            history,
            // Explicit State for Frontend
            currentState: todayLog ? todayLog.status : 'NOT_STARTED'
        });

    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, location } = await req.json();
        const userId = session.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. GEO-FENCING — ZERO MANUAL INPUT (MANDATORY)
        // Global Check for Clock-In
        let computedDistance = 0;

        if (action === 'clock-in') {
            // Load User First to check Role
            const user = await User.findById(userId);
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // GEO-FENCING & GPS ENFORCEMENT
            // RULE: strictly enforce ONLY for 'employee' and 'intern'.
            // Others (Manager, HR, Admin, CXO) can clock in from anywhere (Remote/On-site).
            if (['employee', 'intern'].includes(user.role)) {
                // 1. Check for GPS Payload
                if (!location || !location.latitude || !location.longitude) {
                    await logAudit('CLOCK_IN_FAILED', userId, 'Attendance', 'NEW', { reason: 'Missing GPS', location });
                    return NextResponse.json({
                        error: 'GPS Location is MANDATORY for attendance. Please allow location access.'
                    }, { status: 403 });
                }

                // 2. Validate Coordinates
                if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
                    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 403 });
                }

                // 3. Spoofing Check
                if (location.accuracy && location.accuracy > 2000) {
                    return NextResponse.json({ error: `GPS signal too weak (Accuracy: ${Math.round(location.accuracy)}m).` }, { status: 403 });
                }

                // 4. Distance Check (The actual Geo-Fence)
                // If office location is configured, enforce Radius
                if (user?.workLocation?.latitude && user?.workLocation?.longitude) {
                    // ... existing calculation logic ...
                    // (I will let the next block handle this, or consolidate it here)
                }
            }

            // If office location is configured, enforce Radius
            // If office location is configured, enforce Radius
            // RULE: Strictly enforce 10m range for 'employee' and 'intern' ONLY.
            // Other roles (Managers, HR, Admin) are trusted/exempt from strict geo-lock in POC.
            if (['employee', 'intern'].includes(user.role)) {
                if (user?.workLocation?.latitude && user?.workLocation?.longitude) {
                    const toRad = (value: number) => (value * Math.PI) / 180;
                    const R = 6371e3; // Earth radius in meters
                    const φ1 = toRad(user.workLocation.latitude);
                    const φ2 = toRad(location.latitude);
                    const Δφ = toRad(location.latitude - user.workLocation.latitude);
                    const Δλ = toRad(location.longitude - user.workLocation.longitude);

                    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                        Math.cos(φ1) * Math.cos(φ2) *
                        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const distance = R * c;
                    computedDistance = Math.round(distance);

                    // STRICT 10m RANGE as per requirement
                    const allowedRadius = user.workLocation.radiusMeters || 10;

                    if (distance > allowedRadius) {
                        await logAudit('CLOCK_IN_FAILED', userId, 'Attendance', 'NEW', { reason: 'Geo-fence Violation', distance, allowedRadius, location });
                        return NextResponse.json({
                            // Fix: Show precise distance (e.g., 100.4m) to avoid "100m > 100m" error confusion
                            error: `You are not at the office. Distance: ${distance.toFixed(1)}m. Allowed: ${allowedRadius}m.`
                        }, { status: 403 });
                    }
                } else {
                    // If 'employee'/'intern' has NO work location assigned, should we block?
                    // "office location fixed" implies there Should be one. 
                    // For safety in POC, if no location set, we might allow or block. 
                    // Blocking is safer for "Strict" requirements.
                    await logAudit('CLOCK_IN_FAILED', userId, 'Attendance', 'NEW', { reason: 'No Office Assigned', location });
                    return NextResponse.json({ error: 'No Office Location assigned. Contact HR.' }, { status: 403 });
                }
            }
        }

        // 2. FSM Logic
        if (action === 'clock-in') {
            // Check existing for today
            const existing = await Attendance.findOne({ userId, date: today });

            // STRICT FSM: If ANY record exists today -> 409
            if (existing) {
                await logAudit('CLOCK_IN_REJECTED', userId, 'Attendance', existing._id.toString(), { reason: 'Duplicate' });
                return NextResponse.json({
                    error: 'Attendance already exists for today. Double clock-in prevented.',
                    currentState: existing.status
                }, { status: 409 });
            }

            // Create Record
            const attendance = new Attendance({
                userId,
                date: today,
                clockIn: new Date(),
                status: 'IN_PROGRESS',
                outcome: null, // As per rule, starts null
                geo: {
                    lat: location.latitude,
                    lng: location.longitude,
                    distance: computedDistance
                }
            });

            // ATOMIC COMMIT ATTEMPT
            try {
                await attendance.save();
                // AUDIT LOG - If this fails, we catch and rollback attendance
                await logAudit('CLOCK_IN', userId, 'Attendance', attendance._id.toString(), {
                    geo: attendance.geo,
                    time: attendance.clockIn
                });
            } catch (err: unknown) {
                const anyErr = err as any;
                if (anyErr && anyErr.code === 11000) {
                    return NextResponse.json({
                        error: 'Attendance already exists for today (Race execution blocked).',
                        currentState: 'IN_PROGRESS'
                    }, { status: 409 });
                }

                await Attendance.deleteOne({ _id: attendance._id });
                throw err;
            }

            return NextResponse.json({
                success: true,
                attendance,
                currentState: 'IN_PROGRESS'
            }, { status: 201 });
        }



        else if (['start-break', 'end-break', 'start-meeting', 'end-meeting'].includes(action)) {
            const attendance = await Attendance.findOne({
                userId,
                date: today,
                status: 'IN_PROGRESS'
            });

            if (!attendance) {
                return NextResponse.json({ error: 'No active session found.' }, { status: 409 });
            }

            const now = new Date();

            if (action === 'start-break' || action === 'start-meeting') {
                const activity = action === 'start-break' ? 'break' : 'meeting';

                // Ensure breaks array exists
                if (!attendance.breaks) {
                    attendance.breaks = [];
                }

                // Check if already in a break/meeting
                const activeBreak = attendance.breaks.find((b: any) => !b.endTime);
                if (activeBreak) {
                    return NextResponse.json({ error: `Already in a ${activeBreak.activity}. End it first.` }, { status: 409 });
                }

                attendance.breaks.push({
                    activity,
                    startTime: now
                });

                await attendance.save();
                await logAudit(action.toUpperCase(), userId, 'Attendance', attendance._id.toString(), { startTime: now });

                return NextResponse.json({ success: true, attendance, currentState: 'IN_PROGRESS' });
            }

            if (action === 'end-break' || action === 'end-meeting') {
                const activity = action === 'end-break' ? 'break' : 'meeting';
                // Find active segment
                const activeSegment = attendance.breaks?.find((b: any) => b.activity === activity && !b.endTime);

                if (!activeSegment) {
                    // Graceful handling for 'Ghost' breaks (UI thinks active, DB doesn't)
                    // Just return success so UI clears the state
                    return NextResponse.json({
                        success: true,
                        attendance,
                        currentState: 'IN_PROGRESS',
                        message: `No active ${activity} found to end.`
                    });
                }

                activeSegment.endTime = now;
                const diffMs = now.getTime() - new Date(activeSegment.startTime).getTime();
                activeSegment.duration = Math.round(diffMs / (1000 * 60)); // Minutes

                await attendance.save();
                await logAudit(action.toUpperCase(), userId, 'Attendance', attendance._id.toString(), { duration: activeSegment.duration });

                return NextResponse.json({ success: true, attendance, currentState: 'IN_PROGRESS' });
            }
        }

        else if (action === 'clock-out') {
            // STRICT FSM: Only allowed if IN_PROGRESS
            const attendance = await Attendance.findOne({
                userId,
                date: today,
                status: 'IN_PROGRESS'
            });

            if (!attendance) {
                // Could be because no record (409) or already COMPLETED (409)
                const completed = await Attendance.findOne({ userId, date: today, status: 'COMPLETED' });
                if (completed) {
                    await logAudit('CLOCK_OUT_REJECTED', userId, 'Attendance', completed._id.toString(), { reason: 'Already Completed' });
                    return NextResponse.json({ error: 'Already clocked out.' }, { status: 409 });
                }
                return NextResponse.json({ error: 'No active session found.' }, { status: 409 });
            }

            // Update State
            attendance.clockOut = new Date();
            const diffMs = attendance.clockOut.getTime() - new Date(attendance.clockIn).getTime();
            attendance.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
            attendance.status = 'COMPLETED';

            // Compute Outcome (Basic Logic)
            // 'present' if > 4 hours, else 'half-day' or 'late' logic could go here
            // For now, based on strict request, outcome is computed.
            attendance.outcome = attendance.totalHours > 4 ? 'present' : 'half-day';

            // ATOMIC COMMIT
            try {
                await attendance.save();
                await logAudit('CLOCK_OUT', userId, 'Attendance', attendance._id.toString(), {
                    out: attendance.clockOut,
                    hours: attendance.totalHours
                });
            } catch (err) {
                // Rollback not easily possible for update without session, 
                // but we can try to revert fields if save worked but audit failed.
                // For now, assuming save failure prevents mutation, audit failure throws.
                throw err;
            }

            return NextResponse.json({
                success: true,
                attendance,
                currentState: 'COMPLETED'
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: unknown) {
        console.error('Attendance System Error:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message || 'System Failure' }, { status: 500 });
    }
}
