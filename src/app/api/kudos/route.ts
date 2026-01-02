import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Kudos from '@/models/Kudos';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        await dbConnect();

        // Fetch latest 10 kudos, populated with user details
        const kudos = await Kudos.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('fromUserId', 'firstName lastName profilePicture role position')
            .populate('toUserId', 'firstName lastName profilePicture role position');

        return NextResponse.json(kudos);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { toUserId, message, badge } = await request.json();

        if (!toUserId || !message || !badge) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (session.user.id === toUserId) {
            return NextResponse.json({ error: 'You cannot send kudos to yourself!' }, { status: 400 });
        }

        const newKudos = await Kudos.create({
            fromUserId: session.user.id,
            toUserId,
            message,
            badge
        });

        // Populate the creates kudos to return it immediately
        await newKudos.populate('fromUserId', 'firstName lastName profilePicture');
        await newKudos.populate('toUserId', 'firstName lastName profilePicture');

        return NextResponse.json(newKudos, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
