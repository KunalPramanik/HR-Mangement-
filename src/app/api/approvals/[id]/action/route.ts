import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ApprovalRequest from '@/models/ApprovalRequest';
import User from '@/models/User';
import Leave from '@/models/Leave';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user?.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const { action, comments } = await req.json(); // action: 'approve' | 'reject'
        const requestId = params.id;

        const request = await ApprovalRequest.findById(requestId);
        if (!request) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (request.status !== 'pending') {
            return NextResponse.json({ error: 'Request is already finalized' }, { status: 400 });
        }

        const currentStepIndex = request.currentStep;
        const currentStep = request.steps[currentStepIndex];

        // Authorization Check
        const isSpecific = currentStep.specificApproverId && currentStep.specificApproverId.toString() === user._id.toString();
        const isRole = currentStep.requiredRole && currentStep.requiredRole === user.role;

        // Admins can override? Maybe. For now, strict check.
        const isAdminOverride = user.role === 'admin';

        if (!isSpecific && !isRole && !isAdminOverride) {
            return NextResponse.json({ error: 'You are not authorized to approve this step' }, { status: 403 });
        }

        // Apply Action
        if (action === 'reject') {
            request.status = 'rejected';
            request.steps[currentStepIndex].status = 'rejected';
            request.steps[currentStepIndex].approverId = user._id;
            request.steps[currentStepIndex].comments = comments;
            request.steps[currentStepIndex].actionDate = new Date();

            // If it's a leave request, sync rejection back to Leave model
            if (request.requestType === 'leave' && request.referenceId) {
                await Leave.findByIdAndUpdate(request.referenceId, { status: 'rejected' });
            }

            await request.save();
            return NextResponse.json({ message: 'Request rejected' });
        }

        if (action === 'approve') {
            request.steps[currentStepIndex].status = 'approved';
            request.steps[currentStepIndex].approverId = user._id;
            request.steps[currentStepIndex].comments = comments;
            request.steps[currentStepIndex].actionDate = new Date();

            // Check if there are more steps
            if (currentStepIndex + 1 < request.steps.length) {
                // Move to next step
                request.currentStep = currentStepIndex + 1;
                await request.save();
                return NextResponse.json({ message: 'Step approved, moving to next approver' });
            } else {
                // All steps done! Finalize.
                request.status = 'approved';
                await request.save();

                // AUTOMATICALLY APPLY CHANGES (The "Finalizer")
                await applyFinalChanges(request);

                return NextResponse.json({ message: 'Request fully approved and execution completed' });
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

async function applyFinalChanges(request: any) {
    // 1. Leave
    if (request.requestType === 'leave' && request.referenceId) {
        await Leave.findByIdAndUpdate(request.referenceId, {
            status: 'approved',
            approvedAt: new Date()
        });
    }

    // 2. Profile Update (or 'general_update', 'major_update')
    if (['profile_update', 'general_update', 'major_update'].includes(request.requestType)) {
        if (request.dataPayload && request.requesterId) {
            // Be careful with what we update. 
            // We should only update fields that are in the payload.
            await User.findByIdAndUpdate(request.requesterId, {
                $set: request.dataPayload
            });
        }
    }

    // Add other types logic here
}
