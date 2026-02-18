
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tenantId = session.user.organizationId;
        // Tenant fallback for dev (similar to attendance)
        if (!tenantId) {
            // If dev env, maybe return empty or handle gracefully
            return NextResponse.json({ error: 'Tenant ID missing in session' }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const includeDrafts = searchParams.get('includeDrafts') === 'true';

        let query: any = { tenantId, status: 'Open' };

        // HR/Admin can see drafts
        if (includeDrafts && ['hr', 'admin', 'director'].includes(session.user.role)) {
            query = { tenantId };
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        return NextResponse.json(jobs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !['hr', 'admin', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const tenantId = session.user.organizationId;
        const userId = session.user.id;

        if (!tenantId) return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });

        // Basic validation
        if (!body.title || !body.department || !body.description || !body.location) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newJob = new Job({
            ...body,
            postedBy: userId,
            tenantId,
            status: 'Open'
        });
        await newJob.save();

        // Notify all active users about the new job
        // (Optional: filter notifications by tenant if notification model supports it)
        try {
            const Notification = (await import('@/models/Notification')).default;
            const User = (await import('@/models/User')).default;

            // Find users in same tenant
            const users = await User.find({
                organizationId: tenantId,
                isActive: true,
                _id: { $ne: userId } // Don't notify self
            }).select('_id');

            if (users.length > 0) {
                const notifications = users.map(u => ({
                    userId: u._id,
                    tenantId, // Ensure notification has tenant scope if model supports
                    title: 'New Job Opening',
                    message: `A new position for ${newJob.title} (${newJob.department}) has been posted. Refer someone today!`,
                    type: 'info',
                    link: '/careers', // Or appropriate link
                    read: false,
                    createdAt: new Date()
                }));

                await Notification.insertMany(notifications);
            }
        } catch (err) {
            console.error('Failed to send notifications:', err);
            // Don't fail the request if notifications fail
        }

        return NextResponse.json(newJob, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
