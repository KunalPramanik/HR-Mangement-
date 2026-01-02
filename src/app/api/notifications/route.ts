export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notifications = await Notification.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // Allow HR or Admin to post notifications (or even users to themselves for testing)
        // For now, open to authenticated users to create notifications (system events)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        const notification = await Notification.create({
            userId: data.userId || session.user.id, // allow sending to others if needed later
            title: data.title,
            message: data.message,
            type: data.type || 'info',
            read: false
        });

        return NextResponse.json(notification);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // helper to mark all as read
        const update = await Notification.updateMany(
            { userId: session.user.id, read: false },
            { $set: { read: true } }
        );

        return NextResponse.json({ success: true, count: update.modifiedCount });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
