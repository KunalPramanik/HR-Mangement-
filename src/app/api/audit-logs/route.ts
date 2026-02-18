import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !['admin', 'hr', 'cxo', 'vp', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { organizationId } = session.user;
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const page = parseInt(url.searchParams.get('page') || '1');
        const module = url.searchParams.get('module');

        const query: any = { tenantId: organizationId };
        if (module) query.module = module;

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('performedBy', 'firstName lastName email role') // Populate user details
            .populate('targetUser', 'firstName lastName email');

        const total = await AuditLog.countDocuments(query);

        return NextResponse.json({
            data: logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
