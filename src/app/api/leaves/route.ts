import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Leave from '@/models/Leave';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import User from '@/models/User'; // Ensure User model is loaded for population

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId, id: userId, role } = session.user;
        const url = new URL(req.url);
        const view = url.searchParams.get('view');

        let query: any = { tenantId: organizationId };

        if (view === 'approvals') {
            // "My Action Items" - Leaves where I am the current approver
            query.currentApproverId = userId;
            query.status = 'Pending';
        } else if (view === 'all' && (role === 'admin' || role === 'hr')) {
            // Admin/HR View All
        } else {
            // Default: "My Requests"
            query.employeeId = userId;
        }

        const leaves = await Leave.find(query)
            .sort({ startDate: -1 })
            .populate('employeeId', 'firstName lastName position department profilePicture');

        return NextResponse.json(leaves);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        // Validation
        if (!data.leaveType || !data.startDate || !data.endDate) {
            return NextResponse.json({ error: 'Type, Start Date, and End Date are required' }, { status: 400 });
        }

        const leave = new Leave({
            tenantId: session.user.organizationId,
            employeeId: session.user.id,
            leaveType: data.leaveType,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            reason: data.reason,
            totalDays: (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 3600 * 24), // Simple logic
            status: 'Pending',
            currentApproverId: session.user.managerId // Requires managerId in session
        });

        await leave.save();

        // Log Audit
        await logAudit({
            actionType: 'CREATE',
            module: 'Leave',
            performedBy: session.user.id,
            targetDocumentId: leave._id.toString(),
            description: `Applied for ${leave.totalDays} days leave (${leave.leaveType})`,
            tenantId: session.user.organizationId,
            req
        });

        return NextResponse.json(leave, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
