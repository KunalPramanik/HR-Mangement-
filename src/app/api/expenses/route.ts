
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const tenantId = session.user.organizationId;

        let query: any = { tenantId };

        // If employee, only show their own expenses. If HR/Admin, show all (or filtered).
        const isHR = ['hr', 'admin', 'director'].includes(session.user.role);

        if (!isHR) {
            query.userId = session.user.id;
        } else if (searchParams.get('userId')) {
            query.userId = searchParams.get('userId');
        }

        if (status) {
            query.status = status;
        }

        const expenses = await Expense.find(query)
            .populate('userId', 'firstName lastName email department')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        return NextResponse.json(expenses);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const tenantId = session.user.organizationId;

        if (!tenantId) return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });

        if (!body.amount || !body.category || !body.date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const expense = new Expense({
            ...body,
            userId: session.user.id,
            tenantId,
            status: 'Pending'
        });
        await expense.save();

        return NextResponse.json(expense, { status: 201 });
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
        const { id, status, rejectionReason, ...updateData } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const expense = await Expense.findOne({ _id: id, tenantId: session.user.organizationId });
        if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });

        const isHR = ['hr', 'admin', 'director'].includes(session.user.role);

        // HR can approve/reject
        if (status && isHR) {
            expense.status = status;
            if (status === 'Approved') expense.approvedBy = session.user.id;
            if (status === 'Rejected') expense.rejectionReason = rejectionReason;
            await expense.save();
            return NextResponse.json(expense);
        }

        // Users can edit ONLY if Pending
        if (expense.userId.toString() !== session.user.id && !isHR) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (expense.status !== 'Pending' && !isHR) {
            return NextResponse.json({ error: 'Cannot edit processed expense' }, { status: 400 });
        }

        // Apply updates
        Object.assign(expense, updateData);
        await expense.save();

        return NextResponse.json(expense);
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

        const expense = await Expense.findOne({ _id: id, tenantId: session.user.organizationId });
        if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });

        // Only allow deleting own pending expenses
        if (expense.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        if (expense.status !== 'Pending') {
            return NextResponse.json({ error: 'Cannot delete processed expense' }, { status: 400 });
        }

        await Expense.deleteOne({ _id: id });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
