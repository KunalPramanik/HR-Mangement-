import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Leave from '@/models/Leave';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'hr' && session.user.role !== 'manager')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await request.json(); // 'approved' or 'rejected'

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const leave = await Leave.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!leave) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        return NextResponse.json(leave);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
