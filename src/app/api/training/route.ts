
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Training from '@/models/Training';
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

        const query: any = { tenantId };
        if (status) query.status = status;

        // Show only trainings user is enrolled in if employee?
        // Or show all "Upcoming" for enrollment?
        // For now list all for simplicity

        const trainings = await Training.find(query)
            .sort({ startDate: 1 });

        return NextResponse.json(trainings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        // Only HR/Admin can create training
        if (!session || !['hr', 'admin', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const tenantId = session.user.organizationId;

        if (!body.title || !body.startDate || !body.instructor) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const training = new Training({
            ...body,
            tenantId,
            status: 'Scheduled'
        });
        await training.save();

        return NextResponse.json(training, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
