import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Performance from '@/models/Performance';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch all reviews, populate user and reviewer details
        const reviews = await Performance.find({})
            .populate('userId', 'firstName lastName role department')
            .populate('reviewerId', 'firstName lastName')
            .sort({ createdAt: -1 });

        return NextResponse.json(reviews);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        // Only HR or Manager can create
        if (!session || (session.user.role !== 'hr' && session.user.role !== 'manager')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Loop through array if batch creation, or single object
        // Let's support creating a single review for now to keep it simple, 
        // OR batch for "Cycle".

        // If "action" is "start-cycle", we create pending reviews for ALL users.
        if (body.action === 'start-cycle') {
            const cycleName = body.cycle || `Q${Math.floor((new Date().getMonth() + 3) / 3)} ${new Date().getFullYear()}`;

            const employees = await User.find({ role: 'employee', isActive: true });
            const reviews = [];

            for (const emp of employees) {
                // Check if already exists
                const exists = await Performance.findOne({ userId: emp._id, cycle: cycleName });
                if (!exists) {
                    reviews.push({
                        userId: emp._id,
                        reviewerId: session.user.id, // Assigned to creator initially, or their manager
                        cycle: cycleName,
                        status: 'Pending'
                    });
                }
            }

            if (reviews.length > 0) {
                await Performance.insertMany(reviews);
            }

            return NextResponse.json({ message: `Cycle ${cycleName} started. Created ${reviews.length} reviews.` });
        }

        // Standard Single Create (if needed)
        const review = await Performance.create({
            ...body,
            reviewerId: session.user.id
        });

        return NextResponse.json(review);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
