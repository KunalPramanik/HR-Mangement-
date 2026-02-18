import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Report from '@/models/Report';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await req.json();
        const { type, subject, content } = data;

        const report = new Report({
            tenantId: session.user.organizationId,
            reporterId: session.user.id,
            type,
            subject,
            content
        });

        await report.save();

        return NextResponse.json(report, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const isAdmin = ['admin', 'hr', 'cho', 'vp'].includes(session.user.role);

        let query: any = { tenantId: session.user.organizationId };

        // Employees can only see their own reports
        if (!isAdmin) {
            query.reporterId = session.user.id;
        }

        const reports = await Report.find(query)
            .sort({ createdAt: -1 })
            .populate('reporterId', 'firstName lastName');

        return NextResponse.json(reports);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
