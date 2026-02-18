import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Resignation from '@/models/Resignation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { reason, intendedLastDay } = await req.json();

        if (!reason || !intendedLastDay) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check for existing pending resignation
        const existing = await Resignation.findOne({ userId: session.user.id, status: 'pending' });
        if (existing) {
            return NextResponse.json({ error: 'You already have a pending resignation request.' }, { status: 400 });
        }

        const resignation = new Resignation({
            userId: session.user.id,
            reason,
            intendedLastDay: new Date(intendedLastDay),
            status: 'pending'
        });

        await resignation.save();

        return NextResponse.json(resignation, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // If admin/hr, show all. If employee, show own.
        const isAdmin = ['admin', 'hr', 'director'].includes(session.user.role);
        const query = isAdmin ? {} : { userId: session.user.id };

        const resignations = await Resignation.find(query).populate('userId', 'firstName lastName email position department').sort({ createdAt: -1 });

        return NextResponse.json(resignations);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
