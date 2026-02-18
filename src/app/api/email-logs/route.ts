
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // Only Admins/HR should see logs
        if (!session || !['admin', 'hr', 'director', 'vp'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        // Dynamically import to avoid circular dep issues in some setups
        const { default: Notification } = await import('@/models/Notification');

        const logs = await Notification.find({
            tenantId: session.user.organizationId,
            type: 'system' // Filtering for our "email" logs
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('userId', 'firstName lastName email');

        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
