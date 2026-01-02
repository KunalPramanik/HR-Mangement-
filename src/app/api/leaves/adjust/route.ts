import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/mongodb';
import LeaveBalanceAdjustment from '@/models/LeaveBalanceAdjustment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ADMIN creates the request
export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Only Admins can initiate adjustments' }, { status: 403 });
        }

        const { targetUserId, leaveType, adjustmentDays, reason } = await req.json();

        if (!targetUserId || !leaveType || !adjustmentDays || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const adjustment = await LeaveBalanceAdjustment.create({
            requesterId: new Types.ObjectId(session.user.id),
            targetUserId: new Types.ObjectId(targetUserId),
            leaveType,
            adjustmentDays,
            reason,
            status: 'PENDING_CHO',
            currentStep: 1,
            auditLog: [{
                role: 'admin',
                action: 'CREATED',
                approverId: new Types.ObjectId(session.user.id),
                timestamp: new Date(),
                comments: 'Initiated request'
            }]
        });

        return NextResponse.json(adjustment);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// GET Requests (For Approvers to see list)
export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter');

        let query = {};

        if (session.user.role === 'admin') {
            // Admin sees all their requests
            query = {};
        } else if (session.user.role === 'cxo') {
            query = { status: 'PENDING_CXO' };
        } else if (session.user.role === 'cho') {
            query = { status: 'PENDING_CHO' };
        } else if (session.user.role === 'director') {
            query = { status: 'PENDING_DIRECTOR' };
        } else {
            return NextResponse.json({ data: [] });
        }

        const requests = await LeaveBalanceAdjustment.find(query)
            .populate('requesterId', 'firstName lastName')
            .populate('targetUserId', 'firstName lastName employeeId')
            .sort({ createdAt: -1 });

        return NextResponse.json(requests);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
