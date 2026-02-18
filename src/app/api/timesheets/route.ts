
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Timesheet from '@/models/Timesheet';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tenantId = session.user.organizationId;
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        let query: any = { tenantId };

        // Employees see only their own, HR/Admin see all or filtered
        if (!['hr', 'admin', 'director'].includes(session.user.role)) {
            query.userId = session.user.id;
        } else if (searchParams.get('userId')) {
            query.userId = searchParams.get('userId');
        }

        if (status) query.status = status;

        const timesheets = await Timesheet.find(query)
            .populate('userId', 'firstName lastName email department')
            .sort({ date: -1 });

        return NextResponse.json(timesheets);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tenantId = session.user.organizationId;
        const body = await req.json();

        if (!body.project || !body.task || !body.hours || !body.date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const timesheet = new Timesheet({
            ...body,
            userId: session.user.id,
            tenantId,
            status: 'Pending'
        });
        await timesheet.save();

        return NextResponse.json(timesheet, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { id, status, ...updateData } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const timesheet = await Timesheet.findOne({ _id: id, tenantId: session.user.organizationId });
        if (!timesheet) return NextResponse.json({ error: 'Timesheet not found' }, { status: 404 });

        const isHR = ['hr', 'admin', 'director'].includes(session.user.role);

        // Approval Logic
        if (status && isHR) {
            timesheet.status = status;
            timesheet.approvedBy = session.user.id;
            await timesheet.save();
            return NextResponse.json(timesheet);
        }

        // Edit Logic (User only if Pending)
        if (timesheet.userId.toString() !== session.user.id && !isHR) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        if (timesheet.status !== 'Pending' && !isHR) {
            return NextResponse.json({ error: 'Cannot edit processed timesheet' }, { status: 400 });
        }

        Object.assign(timesheet, updateData);
        await timesheet.save();

        return NextResponse.json(timesheet);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        const timesheet = await Timesheet.findOne({ _id: id, tenantId: session.user.organizationId });
        if (!timesheet) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (timesheet.userId.toString() !== session.user.id && !['hr', 'admin'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (timesheet.status !== 'Pending' && !['hr', 'admin'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Cannot delete processed timesheet' }, { status: 400 });
        }

        await Timesheet.deleteOne({ _id: id });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
