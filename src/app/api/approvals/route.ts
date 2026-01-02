import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ApprovalRequest from '@/models/ApprovalRequest';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateApprovalSteps } from '@/lib/workflow';

// Create a new Approval Request
export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        // data: { type: 'leave' | 'profile_update', referenceId?, payload? }

        // Fetch full user details to decide workflow
        const requester = await User.findOne({ email: session.user?.email });
        if (!requester) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate Steps
        const steps = generateApprovalSteps(requester, data.type, data.payload);

        // Validation: If no steps generated, maybe auto-approve?
        // For now, require at least one step or manual handling.
        let status = 'pending';
        if (steps.length === 0) {
            status = 'approved'; // Auto-approve if no approvers needed
        }

        const newRequest = await ApprovalRequest.create({
            requesterId: requester._id,
            requestType: data.type,
            referenceId: data.referenceId,
            dataPayload: data.payload,
            status: status,
            currentStep: 0,
            steps: steps
        });

        return NextResponse.json(newRequest, { status: 201 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// Get Approvals (Pending for Me OR Created by Me)
export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user?.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const { searchParams } = new URL(req.url);
        const view = searchParams.get('view'); // 'inbox' (to approve) or 'sent' (my requests)

        if (view === 'sent') {
            // My Requests
            const requests = await ApprovalRequest.find({ requesterId: user._id })
                .sort({ createdAt: -1 })
                .populate('requesterId', 'firstName lastName item'); // self?
            return NextResponse.json(requests);

        } else {
            // Inbox: Find requests where I am the CURRENT approver
            // Logic:
            // 1. Request status is 'pending'
            // 2. The step at [currentStep] targets ME (by ID) or MY ROLE.

            // We can't easily express array index lookup in mongo query for dynamic currentStep
            // So we might fetch pending requests and filter in JS, or use aggregation.
            // Aggregation is cleaner.

            const inbox = await ApprovalRequest.aggregate([
                { $match: { status: 'pending' } },
                {
                    $addFields: {
                        activeStep: { $arrayElemAt: ["$steps", "$currentStep"] }
                    }
                },
                {
                    $match: {
                        $or: [
                            { "activeStep.specificApproverId": user._id },
                            { "activeStep.requiredRole": user.role }
                        ]
                    }
                },
                { $sort: { createdAt: -1 } }
            ]);

            // Manually populate requester details if needed (aggregate lookup is verbose)
            // Or just return IDs. Let's do a quick populate via secondary query or $lookup.
            const saturatedInbox = await User.populate(inbox, { path: 'requesterId', select: 'firstName lastName profilePicture department role' });

            return NextResponse.json(saturatedInbox);
        }

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
