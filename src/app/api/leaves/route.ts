import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Leave from '@/models/Leave';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { leaveSchema } from '@/lib/validations';

import ApprovalRequest from '@/models/ApprovalRequest';
import { generateApprovalSteps } from '@/lib/workflow';

import Notification from '@/models/Notification';

export async function POST(req: Request) {
    try {
        const mongoose = await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rawData = await req.json();
        const validation = leaveSchema.safeParse(rawData);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const data = validation.data;

        let status = 'pending';
        let approvedAt = undefined;

        // Transaction Start
        const dbSession = await mongoose.startSession();
        dbSession.startTransaction();

        try {
            // AUTO-APPROVE for 'director' role
            if (session.user.role === 'director') {
                status = 'approved';
                approvedAt = new Date();
            }

            const leave: any = await Leave.create([{
                userId: session.user.id,
                ...data,
                status,
                approvedAt
            }], { session: dbSession });

            const leaveDoc = leave[0];

            // --- Workflow Integration ---
            if (status !== 'approved') {
                const requester = await User.findById(session.user.id).select('firstName lastName role managerId employmentStatus').lean();
                if (requester) {
                    // @ts-ignore
                    const steps = generateApprovalSteps(requester, 'leave', null);

                    let approvalStatus = 'pending';
                    if (steps.length === 0) {
                        leaveDoc.status = 'approved';
                        leaveDoc.approvedAt = new Date();
                        await leaveDoc.save({ session: dbSession });
                        approvalStatus = 'approved';
                    }

                    await ApprovalRequest.create([{
                        requesterId: session.user.id,
                        requestType: 'leave',
                        referenceId: leaveDoc._id,
                        status: approvalStatus,
                        currentStep: 0,
                        steps: steps
                    }], { session: dbSession });
                }
            }

            await dbSession.commitTransaction();

            // Post-transaction notifications (Directors) - Non-blocking
            if (session.user.role === 'director') {
                try {
                    const recipients = await User.find({ role: { $in: ['cho', 'cxo', 'admin'] } }).select('_id');
                    const notificationPromises = recipients.map(recipient =>
                        Notification.create({
                            userId: recipient._id,
                            title: 'Director Leave Alert',
                            message: `Director ${session.user.name || 'Unknown'} has taken ${data.leaveType} leave from ${new Date(data.startDate).toLocaleDateString()} to ${new Date(data.endDate).toLocaleDateString()}. (Auto-Approved)`,
                            type: 'info'
                        })
                    );
                    await Promise.all(notificationPromises);
                } catch (notifyErr) {
                    console.error('Failed to send director notifications', notifyErr);
                }
            }

            return NextResponse.json(leaveDoc);
        } catch (error) {
            await dbSession.abortTransaction();
            throw error;
        } finally {
            dbSession.endSession();
        }

    } catch (error) {
        console.error('Error creating leave request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const view = searchParams.get('view');

        // 1. HR / Admin / Execs: See ALL
        if (['hr', 'admin', 'director', 'cho', 'cxo'].includes(session.user.role)) {
            const leaves = await Leave.find({})
                .populate('userId', 'firstName lastName role department')
                .sort({ createdAt: -1 });
            return NextResponse.json(leaves);
        }

        // 2. Managers: See Direct Reports ONLY (Privacy Fix)
        else if (session.user.role === 'manager') {
            if (view === 'me') {
                // Return own leaves with enrichment
                const leaves = await Leave.find({ userId: session.user.id }).sort({ createdAt: -1 });
                // Enrich with Approval Data for "Pending With" 
                const enrichedLeaves = await Promise.all(leaves.map(async (doc) => {
                    const leave: any = doc.toObject();
                    const approval = await ApprovalRequest.findOne({
                        referenceId: leave._id,
                        requestType: 'leave'
                    })
                        .populate('steps.specificApproverId', 'firstName lastName role')
                        .populate('steps.approverId', 'firstName lastName role');

                    if (approval) {
                        leave.approvalDetails = {
                            status: approval.status,
                            currentStep: approval.currentStep,
                            steps: approval.steps
                        };
                    }
                    return leave;
                }));
                return NextResponse.json(enrichedLeaves);
            }

            // Find direct reports
            const directReports = await User.find({ managerId: session.user.id }).distinct('_id');
            const leaves = await Leave.find({ userId: { $in: directReports } })
                .populate('userId', 'firstName lastName role department')
                .sort({ createdAt: -1 });
            return NextResponse.json(leaves);
        }

        // 3. Employees: See Own (or Team if allowed)
        else {
            if (view === 'team') {
                const teamUserIds = await User.find({ department: session.user.department }).distinct('_id');
                const leaves = await Leave.find({
                    userId: { $in: teamUserIds },
                    status: { $in: ['approved', 'pending'] }
                }).populate('userId', 'firstName lastName').sort({ startDate: 1 });
                return NextResponse.json(leaves);
            }

            // Default: Fetch own
            const leaves = await Leave.find({ userId: session.user.id }).sort({ createdAt: -1 });

            // Enrich with Approval Data for "Pending With" or "Approved By" info
            const enrichedLeaves = await Promise.all(leaves.map(async (doc) => {
                const leave: any = doc.toObject();
                const approval = await ApprovalRequest.findOne({
                    referenceId: leave._id,
                    requestType: 'leave'
                })
                    .populate('steps.specificApproverId', 'firstName lastName role')
                    .populate('steps.approverId', 'firstName lastName role');

                if (approval) {
                    leave.approvalDetails = {
                        status: approval.status,
                        currentStep: approval.currentStep,
                        steps: approval.steps
                    };
                }
                return leave;
            }));

            return NextResponse.json(enrichedLeaves);
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
