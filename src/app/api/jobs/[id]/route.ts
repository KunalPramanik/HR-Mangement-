
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import JobPosting from '@/models/JobPosting';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !['hr', 'admin', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const updatedJob = await JobPosting.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedJob) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json(updatedJob);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !['hr', 'admin', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const deletedJob = await JobPosting.findByIdAndDelete(params.id);

        if (!deletedJob) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Job deleted successfully' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
