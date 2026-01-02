import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Resignation from '@/models/Resignation';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json();

        // specific check: prevent duplicate pending requests
        const existing = await Resignation.findOne({
            userId: session.user.id,
            status: 'pending'
        });

        if (existing) {
            return NextResponse.json({ error: 'You already have a pending resignation request.' }, { status: 400 });
        }

        const resignation = await Resignation.create({
            userId: session.user.id,
            ...data
        });

        return NextResponse.json(resignation, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode'); // 'my' or 'all' (for hr)

        if (mode === 'all') {
            if (!['hr', 'admin', 'director', 'cho'].includes(session.user.role)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            const resignations = await Resignation.find({})
                .populate('userId', 'firstName lastName department position profilePicture')
                .sort({ createdAt: -1 });
            return NextResponse.json(resignations);
        } else {
            // Default: Fetch my resignation
            const resignation = await Resignation.findOne({ userId: session.user.id }).sort({ createdAt: -1 });
            return NextResponse.json(resignation); // Return object or null
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        // Only HR/Admin can approve for now (simplifying)
        if (!session || !['hr', 'admin', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { id, status, comments } = data;

        const resignation = await Resignation.findByIdAndUpdate(
            id,
            { status, hrComments: comments },
            { new: true }
        );

        if (!resignation) {
            return NextResponse.json({ error: 'Resignation not found' }, { status: 404 });
        }

        if (status === 'approved' || status === 'completed') {
            // Optionally update User status to 'notice_period' automatically
            await User.findByIdAndUpdate(resignation.userId, {
                employmentStatus: 'notice_period'
            });
        }

        return NextResponse.json(resignation);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
