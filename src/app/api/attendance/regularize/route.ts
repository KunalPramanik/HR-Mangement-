import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import RegularizationRequest from '@/models/RegularizationRequest';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// CREATE REQUEST
export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { attendanceId, proposedClockIn, proposedClockOut, reason } = await req.json();

        // Validation
        if (!attendanceId || !proposedClockIn || !reason) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existing = await RegularizationRequest.findOne({ attendanceId, status: 'Pending' });
        if (existing) {
            return NextResponse.json({ error: 'Request already pending' }, { status: 409 });
        }

        const reqDoc = await RegularizationRequest.create({
            userId: session.user.id,
            attendanceId,
            proposedClockIn: new Date(proposedClockIn),
            proposedClockOut: proposedClockOut ? new Date(proposedClockOut) : undefined,
            reason
        });

        await logAudit('REQUEST_REGULARIZATION', session.user.id, 'RegularizationRequest', reqDoc._id.toString());

        return NextResponse.json(reqDoc);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// APPROVE/REJECT (Manager/HR)
export async function PUT(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // RBAC
        if (!session || !['manager', 'hr', 'admin'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { requestId, status, comments } = await req.json();
        const request = await RegularizationRequest.findById(requestId).populate('attendanceId');

        if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

        // Verify Manager (if manager role)
        // TODO: In prod, strictly check if request.userId is managed by session.user.id

        if (status === 'Approved') {
            const att = await Attendance.findById(request.attendanceId);
            if (!att) return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });

            // PAYROLL LOCK CHECK
            const date = new Date(att.date);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            // Dynamic Import to avoid cycle if needed, or stick to top level if safe.
            // Using Payslip model
            const Payslip = (await import('@/models/Payslip')).default;
            const locked = await Payslip.exists({ userId: request.userId, month: monthStr });

            if (locked) {
                await logAudit('REGULARIZATION_REJECTED_PAYROLL_LOCKED', session.user.id, 'RegularizationRequest', requestId, { month: monthStr });
                return NextResponse.json({
                    error: `Payroll for ${monthStr} is already generated/locked. You must rollback the payroll before modifying attendance.`
                }, { status: 403 });
            }
        }

        request.status = status;
        request.approverId = session.user.id;
        await request.save();

        if (status === 'Approved') {
            const att = await Attendance.findById(request.attendanceId);
            if (att) {
                att.clockIn = request.proposedClockIn;
                if (request.proposedClockOut) att.clockOut = request.proposedClockOut;

                // Recalculate duration
                if (att.clockOut) {
                    const diff = new Date(att.clockOut).getTime() - new Date(att.clockIn).getTime();
                    att.totalHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
                }

                att.outcome = 'present';
                if (att.clockOut) att.status = 'COMPLETED';
                att.notes = `Regularized by ${session.user.name}: ${request.reason}`;
                await att.save();
            }
        }

        await logAudit(`REGULARIZATION_${status.toUpperCase()}`, session.user.id, 'Attendance', request.attendanceId.toString(), { status });

        return NextResponse.json({ success: true, request });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
