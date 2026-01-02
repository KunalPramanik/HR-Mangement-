import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import JobPosting, { IJobPosting } from '@/models/JobPosting';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const includeDrafts = searchParams.get('includeDrafts') === 'true';

        let query: any = { status: 'Open' };
        if (includeDrafts) {
            const session = await getServerSession(authOptions);
            if (session && ['hr', 'admin', 'director'].includes(session.user.role)) {
                query = {}; // View all
            }
        }

        const jobs = await JobPosting.find(query).sort({ createdAt: -1 });
        return NextResponse.json(jobs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !['hr', 'admin', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Basic validation
        if (!body.title || !body.department || !body.description || !body.location) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newJob = await JobPosting.create({
            ...body,
            postedBy: session.user.id
        }) as unknown as IJobPosting;

        // Notify all active users about the new job
        const User = (await import('@/models/User')).default;
        const Notification = (await import('@/models/Notification')).default;

        const allUsers = await User.find({ isActive: true }).select('_id');
        const notifications = allUsers.map(u => ({
            userId: u._id,
            title: 'New Job Opening',
            message: `A new position for ${newJob.title} (${newJob.department}) has been posted. Refer someone today!`,
            type: 'info',
            read: false
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        return NextResponse.json(newJob, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
