import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Policy from '@/models/Policy';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        const policies = await Policy.find({ active: true }).sort({ category: 1, title: 1 });
        return NextResponse.json(policies);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !['admin', 'hr', 'director', 'cho'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const policy = await Policy.create(data);
        return NextResponse.json(policy, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
