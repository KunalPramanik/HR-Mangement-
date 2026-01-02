import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // If HR/Admin, see all. If Employee, see own?
        // HR Portal context implies HR sees all.
        // Assuming this route is for the LIST view.

        // I'll return ALL for now to enable the HR Tickets Page.
        const tickets = await Ticket.find({})
            .populate('userId', 'firstName lastName')
            .sort({ createdAt: -1 });

        return NextResponse.json(tickets);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await req.json();

        // Generate Ticket Number (simple random or sequence)
        const count = await Ticket.countDocuments();
        const ticketNumber = `TKT-${1000 + count + 1}`;

        const ticket = await Ticket.create({
            ...data,
            ticketNumber,
            userId: session.user.id
        });

        return NextResponse.json(ticket);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
