import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LeaveBalanceAdjustment from '@/models/LeaveBalanceAdjustment';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Types } from 'mongoose';

// APPROVE flow
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { action, comments } = await req.json(); // action = 'APPROVE' | 'REJECT'
        const adjustment = await LeaveBalanceAdjustment.findById(params.id);

        if (!adjustment) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

        // Logic Check
        if (action === 'REJECT') {
            adjustment.status = 'REJECTED';
            adjustment.auditLog.push({
                role: session.user.role,
                action: 'REJECTED',
                approverId: new Types.ObjectId(session.user.id),
                timestamp: new Date(),
                comments
            });
            await adjustment.save();
            return NextResponse.json(adjustment);
        }

        // APPROVAL CHAIN
        // APPROVAL CHAIN
        if (adjustment.status === 'PENDING_CHO') {
            if (session.user.role !== 'cho') return NextResponse.json({ error: 'Wait for CHO Approval' }, { status: 403 });

            adjustment.status = 'PENDING_CXO';
            adjustment.currentStep = 2;
        }
        else if (adjustment.status === 'PENDING_CXO') {
            if (session.user.role !== 'cxo') return NextResponse.json({ error: 'Wait for CXO Approval' }, { status: 403 });

            adjustment.status = 'PENDING_DIRECTOR';
            adjustment.currentStep = 3;
        }
        else if (adjustment.status === 'PENDING_DIRECTOR') {
            if (session.user.role !== 'director') return NextResponse.json({ error: 'Wait for Director Approval' }, { status: 403 });

            // FINAL APPROVAL - EXECUTE
            const user = await User.findById(adjustment.targetUserId);
            if (!user) return NextResponse.json({ error: 'Target user not found' }, { status: 404 });

            // Update Balance
            const type = adjustment.leaveType; // annual, sick, personal
            if (user.leaveBalance && typeof user.leaveBalance[type] === 'number') {
                user.leaveBalance[type] += adjustment.adjustmentDays;
                await user.save();
            }

            adjustment.status = 'APPROVED';
        }

        adjustment.auditLog.push({
            role: session.user.role,
            action: 'APPROVED',
            approverId: new Types.ObjectId(session.user.id),
            timestamp: new Date(),
            comments
        });

        await adjustment.save();
        return NextResponse.json(adjustment);

    } catch (error: any) {
        console.error('Adjustment Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
