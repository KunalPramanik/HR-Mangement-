import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Holiday from '@/models/Holiday';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        const holidays = await Holiday.find({}).sort({ date: 1 });
        return NextResponse.json(holidays);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !['hr', 'admin', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const holiday = await Holiday.create(data);
        return NextResponse.json(holiday, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    // Seed Functionality
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !['admin', 'hr', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const holidays = require('@/lib/indian-holidays.json');

        // Clear existing to avoid dupes or check one by one? 
        // Let's just create if not exists
        let count = 0;
        for (const h of holidays) {
            const exists = await Holiday.findOne({ date: new Date(h.date) });
            if (!exists) {
                await Holiday.create(h);
                count++;
            }
        }

        return NextResponse.json({ message: `Seeded ${count} holidays` });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !['hr', 'admin', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await Holiday.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Deleted' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
