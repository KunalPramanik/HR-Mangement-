
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Asset from '@/models/Asset';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tenantId = session.user.organizationId;
        if (!tenantId) return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        let query: any = { tenantId };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { serialNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const assets = await Asset.find(query).populate('assignedTo', 'firstName lastName email').sort({ createdAt: -1 });
        return NextResponse.json(assets);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !['hr', 'admin', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const tenantId = session.user.organizationId;
        if (!tenantId) return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });

        if (!body.name || !body.serialNumber || !body.type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const asset = new Asset({
            ...body,
            tenantId,
            status: body.assignedTo ? 'Assigned' : 'Available',
            assignedDate: body.assignedTo ? new Date() : undefined
        });
        await asset.save();

        return NextResponse.json(asset, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !['hr', 'admin', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const asset = await Asset.findOneAndUpdate(
            { _id: id, tenantId: session.user.organizationId },
            updateData,
            { new: true }
        );

        if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

        return NextResponse.json(asset);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !['hr', 'admin', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await Asset.deleteOne({ _id: id, tenantId: session.user.organizationId });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
