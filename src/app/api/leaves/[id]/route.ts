import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Leave from '@/models/Leave';
import Attendance from '@/models/Attendance';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const leave = await Leave.findById(id);

        if (!leave) return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });

        // Verify Access
        // Only:
        // 1. Current Approver (Manager)
        // 2. HR / Admin (Override)
        // 3. User (Cancel)

        const data = await req.json();

        // 1. Cancel Logic (User Only)
        if (data.status === 'Cancelled') {
            if (leave.employeeId.toString() !== session.user.id) {
                return NextResponse.json({ error: 'Only the applicant can cancel their request' }, { status: 403 });
            }
            if (leave.status !== 'Pending') {
                return NextResponse.json({ error: 'Cannot cancel an already processed request' }, { status: 400 });
            }
            // OK to cancel
            leave.status = 'Cancelled';
            leave.cancelReason = data.cancelReason;
        }

        // 2. Approve/Reject Logic (Manager/HR Only)
        else if (data.status === 'Approved' || data.status === 'Rejected') {
            // Check if user is manager or higher
            const isApprover = leave.currentApproverId?.toString() === session.user.id;
            const isAdmin = ['admin', 'hr', 'cho', 'director', 'vp'].includes(session.user.role);

            // Allow managers and admins to approve
            if (!isApprover && !isAdmin) {
                return NextResponse.json({ error: 'Forbidden: You are not authorized to approve/reject this request.' }, { status: 403 });
            }

            // Update status (Simple 1-step approval for MVP, complex flow later)
            // If Approved, update final status. If Rejected, update final status.
            // If needs multi-level, logic would complicate. Assuming single-owner or admin override.

            leave.status = data.status;

            // Add to approval history
            if (!leave.approvals) leave.approvals = [];
            leave.approvals.push({
                level: leave.approvals.length + 1,
                approverId: session.user.id as any,
                status: data.status,
                comments: data.comments,
                actionDate: new Date()
            });

            // If Approved, Create Attendance Records
            if (data.status === 'Approved') {
                const startDate = new Date(leave.startDate);
                const endDate = new Date(leave.endDate);

                // Iterate dates
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    // Check if weekend? For now assume leave covers all selected days including weekends if user selected them.
                    // Or check business days? 
                    // Simple logic: Mark all days in range as On-Leave.

                    // Upsert Attendance
                    await Attendance.findOneAndUpdate(
                        {
                            tenantId: session.user.organizationId,
                            employeeId: leave.employeeId,
                            date: new Date(d) // Normalize time component? Usually models handle this or we stick to UTC midnight
                        },
                        {
                            $set: {
                                status: 'On-Leave',
                                notes: `Leave Request Approved (ID: ${leave._id})`
                            }
                        },
                        { upsert: true, new: true }
                    );
                }
            }
        } else {
            return NextResponse.json({ error: 'Invalid Status' }, { status: 400 });
        }

        await leave.save();

        // Log Audit
        await logAudit({
            actionType: data.status === 'Cancelled' ? 'UPDATE' : 'APPROVE', // or REJECT
            module: 'Leave',
            performedBy: session.user.id,
            targetDocumentId: leave._id.toString(),
            description: `${data.status} leave request (ID: ${id})`,
            tenantId: session.user.organizationId,
            diff: [{ field: 'status', oldValue: leave.status, newValue: data.status }],
            req
        });

        return NextResponse.json(leave);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
