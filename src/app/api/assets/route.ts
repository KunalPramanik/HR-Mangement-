import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Asset from '@/models/Asset';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !['hr', 'admin', 'director', 'cxo'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const assets = await Asset.find({})
            .populate('assignedTo', 'firstName lastName employeeId')
            .sort({ createdAt: -1 });

        return NextResponse.json(assets);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !['hr', 'admin', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Basic validation
        if (!body.name || !body.type || !body.serialNumber) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check duplicate serial number
        const existing = await Asset.findOne({ serialNumber: body.serialNumber });
        if (existing) {
            return NextResponse.json({ error: 'Asset with this Serial Number already exists' }, { status: 400 });
        }

        const newAsset = await Asset.create(body);
        return NextResponse.json(newAsset, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
