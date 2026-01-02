import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Announcement from '@/models/Announcement';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'hr') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        const announcement = await Announcement.create({
            ...data,
            authorId: session.user.id,
            isPublished: true,
            publishedAt: new Date()
        });

        return NextResponse.json(announcement, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const announcements = await Announcement.find({})
            .sort({ createdAt: -1 })
            .populate('authorId', 'firstName lastName'); // Show who posted
        return NextResponse.json(announcements);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
