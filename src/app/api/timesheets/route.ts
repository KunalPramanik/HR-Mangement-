import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Timesheet from '@/models/Timesheet';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const tenantId = session.user.organizationId;

        // Basic validation
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

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        let query: any = { userId: session.user.id };

        if (start && end) {
            query.date = {
                $gte: new Date(start),
                $lte: new Date(end)
            };
        }

        const timesheets = await Timesheet.find(query).sort({ date: -1 });
        return NextResponse.json(timesheets);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
