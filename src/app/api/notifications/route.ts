
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = session.user.id;
        const tenantId = session.user.organizationId;

        // Fetch last 50 notifications for the user
        // Filter by userId. TenantId is implicit if userId is unique, but good practice to include
        const query = { userId };
        if (tenantId) Object.assign(query, { tenantId });

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json(notifications);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const tenantId = session.user.organizationId || body.tenantId;

        if (!tenantId) return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });

        if (!body.title || !body.message || !body.userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const notification = new Notification({
            ...body,
            tenantId,
            read: false,
            createdAt: new Date()
        });
        await notification.save();

        return NextResponse.json(notification, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = session.user.id;
        const body = await req.json();

        // Mark specific or all as read
        if (body.id) {
            await Notification.updateOne({ _id: body.id, userId }, { read: true });
        } else {
            // Mark all unread as read
            await Notification.updateMany({ userId, read: false }, { read: true });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = session.user.id;

        // Clear all or specfic
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            await Notification.deleteOne({ _id: id, userId });
        } else {
            await Notification.deleteMany({ userId });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
