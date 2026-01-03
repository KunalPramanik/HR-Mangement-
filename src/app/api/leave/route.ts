import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Leave from '@/models/Leave';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import ApprovalRequest from '@/models/ApprovalRequest';
import { generateApprovalSteps } from '@/lib/workflow';

import Notification from '@/models/Notification';

export async function POST(req: Request) {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        // Basic validation
        if (!data.startDate || !data.endDate || !data.leaveType || !data.reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let status = 'pending';
        let approvedAt = undefined;

        // AUTO-APPROVE for 'director' role as per user request
        if (session.user.role === 'director') {
            status = 'approved';
            approvedAt = new Date();

            // NOTIFICATION LOGIC: Notify CHO, CXO, ADMIN only
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

        const leave: any = await Leave.create({
            userId: session.user.id,
            ...data,
            status,
            approvedAt
        });

        // --- Workflow Integration ---
        // Only trigger workflow if NOT already approved (i.e., not a director)
        if (status !== 'approved') {
            try {
                const requester = await User.findById(session.user.id).select('firstName lastName role managerId employmentStatus').lean();
                if (requester) {
                    // @ts-ignore
                    const steps = generateApprovalSteps(requester, 'leave', null);

                    let approvalStatus = 'pending';
                    if (steps.length === 0) {
                        // If no steps needed, auto approve
                        leave.status = 'approved';
                        leave.approvedAt = new Date();
                        await leave.save();
                        approvalStatus = 'approved';
                    }

                    await ApprovalRequest.create({
                        requesterId: session.user.id,
                        requestType: 'leave',
                        referenceId: leave._id,
                        status: approvalStatus,
                        currentStep: 0,
                        steps: steps
                    });
                }
            } catch (wfError) {
                console.error('Workflow creation failed, but leave saved:', wfError);
            }
        }

        return NextResponse.json(leave);
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

        // Check if HR
        // Check if HR or Admin/Executive
        if (['hr', 'admin', 'director', 'cho', 'cxo'].includes(session.user.role)) {
            // Fetch all, populate user details
            const leaves = await Leave.find({})
                .populate('userId', 'firstName lastName role department')
                .sort({ createdAt: -1 });
            return NextResponse.json(leaves);
        } else if (session.user.role === 'manager') {
            // Fetch leaves for users in the same department
            // Need to find users first

            const teamUserIds = await User.find({ department: session.user.department }).distinct('_id');
            const leaves = await Leave.find({ userId: { $in: teamUserIds } })
                .populate('userId', 'firstName lastName role department')
                .sort({ createdAt: -1 });
            return NextResponse.json(leaves);
        } else {
            // Employee: Check for team view
            const url = new URL(req.url);
            const view = url.searchParams.get('view');

            if (view === 'team') {
                // Fetch leaves for users in the same department
                const teamUserIds = await User.find({ department: session.user.department }).distinct('_id');
                // Return all leaves for team members
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
                // Find Approval Request linked to this leave
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
