import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json();

        // Basic validation: must have content
        if (!data.content || (!data.receiverId && !data.role)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const message = await Message.create({
            senderId: session.user.id,
            ...data
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = session.user.id;
        const userRole = session.user.role;

        // Fetch messages where:
        // 1. Receiver is current user
        // 2. Role matches current user's role
        // 3. Role is 'all'

        const messages = await Message.find({
            $or: [
                { receiverId: userId },
                { role: userRole },
                { role: 'all' }
            ]
        })
            .populate('senderId', 'firstName lastName profilePicture')
            .sort({ createdAt: -1 });

        return NextResponse.json(messages);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
