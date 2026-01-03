import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LoginSession from '@/models/LoginSession';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await dbConnect();
    const session = await LoginSession.findOne({ sessionId: id });

    if (!session) return NextResponse.json({ status: 'expired' });

    if (session.status === 'authenticated' && session.loginToken) {
        return NextResponse.json({
            status: 'authenticated',
            token: session.loginToken
        });
    }

    return NextResponse.json({ status: session.status });
}
