import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { action, location } = await req.json();

        console.log('Attendance API - Received action:', action, 'Location:', location);
        console.log('Session user:', JSON.stringify(session.user, null, 2));

        // Validate action
        const validActions = ['clock-in', 'clock-out', 'start-break', 'end-break', 'start-meeting', 'end-meeting'];
        if (!validActions.includes(action)) {
            console.error('Invalid action received:', action);
            return NextResponse.json({ error: `Invalid action: ${action}. Valid actions are: ${validActions.join(', ')}` }, { status: 400 });
        }

        // Validate location for clock actions
        if ((action === 'clock-in' || action === 'clock-out') && !location) {
            return NextResponse.json({ error: 'Location is required' }, { status: 400 });
        }

        const userId = session.user.id;
        let tenantId = session.user.organizationId;

        // Development fallback: If organizationId is missing, use a default one
        // This happens when users are created without proper organization setup
        if (!tenantId) {
            console.warn('⚠️ No organizationId in session. Using development fallback.');
            console.warn('⚠️ User should log out and log in again, or update their profile.');

            // Try to get organizationId from the user in database
            const User = (await import('@/models/User')).default;
            const dbUser = await User.findById(userId).select('organizationId');

            if (dbUser?.organizationId) {
                tenantId = dbUser.organizationId.toString();
                console.log('✅ Found organizationId in database:', tenantId);
            } else {
                // Last resort: create a default organization for development
                const mongoose = await import('mongoose');
                tenantId = new mongoose.Types.ObjectId().toString();
                console.error('❌ No organizationId found. Using temporary ID:', tenantId);
                console.error('❌ This user needs to be assigned to an organization!');
            }
        }

        console.log('Using tenantId:', tenantId, 'userId:', userId);

        // Normalize date to start of day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            employeeId: userId,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });

        let currentState = 'NOT_STARTED';

        if (action === 'clock-in') {
            if (attendance) return NextResponse.json({ error: 'Already clocked in today' }, { status: 400 });

            const checkInTime = new Date();
            const hour = checkInTime.getHours();
            const minute = checkInTime.getMinutes();
            const isLate = hour > 9 || (hour === 9 && minute > 30); // Late if after 9:30 AM

            console.log('Creating new attendance record with tenantId:', tenantId);

            attendance = new Attendance({
                tenantId,
                employeeId: userId,
                date: new Date(),
                checkIn: checkInTime,
                checkInLocation: {
                    lat: location.latitude,
                    lng: location.longitude,
                    isValid: true
                },
                status: isLate ? 'Late' : 'Present',
                isLate,
                breaks: []
            });

            currentState = 'IN_PROGRESS';
        }
        else if (action === 'clock-out') {
            if (!attendance) return NextResponse.json({ error: 'No active session found. Please clock in first.' }, { status: 400 });
            if (attendance.checkOut) return NextResponse.json({ error: 'Already clocked out' }, { status: 400 });

            attendance.checkOut = new Date();
            attendance.checkOutLocation = {
                lat: location.latitude,
                lng: location.longitude,
                isValid: true
            };

            // Calculate total hours
            if (attendance.checkIn) {
                const diff = (attendance.checkOut.getTime() - attendance.checkIn.getTime()) / (1000 * 3600);
                attendance.totalWorkHours = parseFloat(diff.toFixed(2));

                // Calculate overtime (if worked more than 9 hours)
                if (diff > 9) {
                    attendance.overtimeHours = parseFloat((diff - 9).toFixed(2));
                }
            }

            currentState = 'COMPLETED';
        }
        else if (action === 'start-break' || action === 'start-meeting') {
            if (!attendance) return NextResponse.json({ error: 'No active session found. Please clock in first.' }, { status: 400 });
            if (attendance.checkOut) return NextResponse.json({ error: 'Already clocked out' }, { status: 400 });

            // Check if there's already an active break/meeting
            const activeBreak = attendance.breaks.find(b => !b.endTime);
            if (activeBreak) {
                return NextResponse.json({ error: 'Please end current break/meeting first' }, { status: 400 });
            }

            attendance.breaks.push({
                activity: action === 'start-break' ? 'break' : 'meeting',
                startTime: new Date(),
                durationMinutes: 0
            });

            currentState = 'IN_PROGRESS';
        }
        else if (action === 'end-break' || action === 'end-meeting') {
            if (!attendance) return NextResponse.json({ error: 'No active session found' }, { status: 400 });

            const activityType = action === 'end-break' ? 'break' : 'meeting';
            const lastBreak = attendance.breaks.reverse().find(b => b.activity === activityType && !b.endTime);

            if (!lastBreak) {
                return NextResponse.json({ error: `No active ${activityType} found` }, { status: 400 });
            }

            lastBreak.endTime = new Date();
            const durationMs = lastBreak.endTime.getTime() - lastBreak.startTime.getTime();
            lastBreak.durationMinutes = Math.round(durationMs / (1000 * 60));

            // Reverse back to original order
            attendance.breaks.reverse();

            currentState = 'IN_PROGRESS';
        }

        // TypeScript null check (should never happen due to logic above)
        if (!attendance) {
            return NextResponse.json({ error: 'Failed to create or update attendance' }, { status: 500 });
        }

        await attendance.save();

        await logAudit({
            actionType: action === 'clock-in' ? 'CREATE' : 'UPDATE',
            module: 'Attendance',
            performedBy: userId,
            targetDocumentId: attendance._id.toString(),
            description: `${action} at ${new Date().toLocaleTimeString()}`,
            tenantId,
            req
        });

        return NextResponse.json({
            success: true,
            currentState,
            attendance: {
                _id: attendance._id,
                clockIn: attendance.checkIn,
                clockOut: attendance.checkOut,
                totalHours: attendance.totalWorkHours,
                status: attendance.status,
                breaks: attendance.breaks
            }
        });

    } catch (error: any) {
        console.error('Attendance API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = session.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get today's attendance
        const todayAttendance = await Attendance.findOne({
            employeeId: userId,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });

        // Get recent history (last 10 days)
        const history = await Attendance.find({
            employeeId: userId,
            date: { $lt: today }
        })
            .sort({ date: -1 })
            .limit(10);

        // Determine current state
        let currentState = 'NOT_STARTED';
        if (todayAttendance) {
            if (todayAttendance.checkOut) {
                currentState = 'COMPLETED';
            } else if (todayAttendance.checkIn) {
                currentState = 'IN_PROGRESS';
            }
        }

        return NextResponse.json({
            currentState,
            todayLog: todayAttendance ? {
                clockIn: todayAttendance.checkIn,
                clockOut: todayAttendance.checkOut,
                totalHours: todayAttendance.totalWorkHours,
                breaks: todayAttendance.breaks,
                status: todayAttendance.status
            } : null,
            history: history.map(att => ({
                _id: att._id,
                date: att.date,
                clockIn: att.checkIn,
                clockOut: att.checkOut,
                totalHours: att.totalWorkHours,
                status: att.status
            }))
        });

    } catch (error: any) {
        console.error('Attendance GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
