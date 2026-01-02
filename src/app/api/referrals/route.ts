import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Referral from '@/models/Referral';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.jobId || !body.candidateName || !body.candidateEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newReferral = await Referral.create({
            ...body,
            referrerId: session.user.id
        });

        return NextResponse.json(newReferral, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // HR sees all, Users see their own
        const isHR = session && ['hr', 'admin', 'director'].includes(session.user.role);

        const { searchParams } = new URL(request.url);

        let query: any = {};
        if (!isHR) {
            if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            query.referrerId = session.user.id;
        }

        const referrals = await Referral.find(query)
            .populate('jobId', 'title department')
            .populate('referrerId', 'firstName lastName')
            .sort({ createdAt: -1 });

        return NextResponse.json(referrals);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
