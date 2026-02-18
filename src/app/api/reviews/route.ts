import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PerformanceReview from '@/models/PerformanceReview';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId, id: userId, role } = session.user;

        const query: any = { tenantId: organizationId };

        if (!['admin', 'hr', 'director', 'vp', 'cho', 'cxo'].includes(role)) {
            // Regular user: See only MY reviews
            // Manager: See MY reviews + Team reviews? 
            if (role === 'manager') {
                // For now, let's just return reviews where I am employee OR manager
                query.$or = [{ employeeId: userId }, { managerId: userId }];
            } else {
                query.employeeId = userId;
            }
        }

        // Populate names
        const reviews = await PerformanceReview.find(query)
            .sort({ cycleName: -1 })
            .populate('employeeId', 'firstName lastName position')
            .populate('managerId', 'firstName lastName');

        return NextResponse.json(reviews);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !['admin', 'hr', 'director', 'vp'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized: Only HR/Admins can start review cycles' }, { status: 403 });
        }

        const data = await req.json();

        // Expect: { cycleName, startDate, endDate, participants: [{ employeeId, managerId }] }
        // Or simple: Just create one for now? Usually bulk creation.

        if (!data.cycleName || !data.participants || !Array.isArray(data.participants)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const reviews = [];
        for (const p of data.participants) {
            const review = new PerformanceReview({
                tenantId: session.user.organizationId,
                cycleName: data.cycleName,
                employeeId: p.employeeId,
                managerId: p.managerId, // Optional override or fetch from user
                status: 'Self-Review',
                periodStart: data.startDate,
                periodEnd: data.endDate
            });
            reviews.push(review);
        }

        await PerformanceReview.insertMany(reviews);

        await logAudit({
            actionType: 'CREATE',
            module: 'Review',
            performedBy: session.user.id,
            description: `Started review cycle "${data.cycleName}" for ${reviews.length} employees`,
            tenantId: session.user.organizationId,
            req
        });

        return NextResponse.json({ message: `Created ${reviews.length} reviews` }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
