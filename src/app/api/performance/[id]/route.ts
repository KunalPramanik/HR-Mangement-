import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Performance from '@/models/Performance';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const review = await Performance.findById(params.id)
            .populate('userId', 'firstName lastName role department')
            .populate('reviewerId', 'firstName lastName');

        if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

        return NextResponse.json(review);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await req.json();

        // Validation logic can go here (e.g. only reviewer can update)

        const review = await Performance.findByIdAndUpdate(params.id, data, { new: true });

        if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

        return NextResponse.json(review);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
