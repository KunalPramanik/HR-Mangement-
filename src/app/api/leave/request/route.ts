import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth'; // Adjust path if needed
import dbConnect from '@/lib/dbConnect';
import Leave from '@/models/Leave';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { leaveType, startDate, endDate, reason } = body;

        if (!leaveType || !startDate || !endDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Calculate days (rough estimation, ideally should exclude weekends/holidays)
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

        // Get Manager for Approval
        const user = await User.findById(session.user.id);
        const managerId = user?.managerId;

        const newLeave = new Leave({
            tenantId: session.user.organizationId || session.user.tenantId,
            employeeId: session.user.id,
            leaveType,
            startDate,
            endDate,
            totalDays,
            reason,
            status: 'Pending',
            currentApproverId: managerId || session.user.id, // Fallback to self (or admin) if no manager
            approvals: managerId ? [{
                level: 1,
                approverId: managerId,
                status: 'Pending'
            }] : []
        });

        await newLeave.save();

        return NextResponse.json({ message: 'Leave request submitted successfully', leave: newLeave }, { status: 201 });

    } catch (error: any) {
        console.error('Leave Request Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
