
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

import User from '@/models/User';

// Helper to update User assets
const updateUserAssets = async (userId: string | undefined, asset: any, action: 'add' | 'remove') => {
    if (!userId) return;
    try {
        if (action === 'add') {
            await User.findByIdAndUpdate(userId, {
                $push: {
                    assets: {
                        assetId: asset._id,
                        type: asset.type,
                        name: asset.name,
                        allocatedDate: new Date(),
                        status: 'Allocated'
                    }
                }
            });
        } else {
            await User.findByIdAndUpdate(userId, {
                $pull: { assets: { assetId: asset._id } }
            });
        }
    } catch (e) {
        console.error('Failed to sync user assets', e);
    }
};

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

        // Auto-set status if assigned
        const status = body.assignedTo ? 'Assigned' : (body.status || 'Available');
        const assignedDate = body.assignedTo ? new Date() : undefined;

        const asset = new Asset({
            ...body,
            status,
            assignedDate,
            tenantId
        });
        await asset.save();

        // Sync with User
        if (body.assignedTo) {
            await updateUserAssets(body.assignedTo, asset, 'add');
        }

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

        // Get existing to check changes
        const existingAsset = await Asset.findOne({ _id: id, tenantId: session.user.organizationId });
        if (!existingAsset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

        const oldAssignee = existingAsset.assignedTo?.toString();
        const newAssignee = updateData.assignedTo;

        // Update logic
        if (updateData.status === 'Assigned' && !newAssignee) {
            // If manual status set to assigned but no user, strictly require user or revert? 
            // Let's assume frontend validates.
        }

        const asset = await Asset.findOneAndUpdate(
            { _id: id },
            updateData,
            { new: true }
        );

        // Sync Logic
        // 1. If assigned changed (Old User -> New User)
        if (oldAssignee && newAssignee && oldAssignee !== newAssignee) {
            await updateUserAssets(oldAssignee, existingAsset, 'remove');
            await updateUserAssets(newAssignee, asset, 'add');
        }
        // 2. If newly assigned (Null -> User)
        else if (!oldAssignee && newAssignee) {
            await updateUserAssets(newAssignee, asset, 'add');
        }
        // 3. If unassigned (User -> Null) or Status changed to not Assigned
        else if (oldAssignee && (!newAssignee || updateData.status !== 'Assigned')) {
            // If status changed to Available/Maintenance/etc, technically it's unassigned
            // But usually we clear assignedTo as well.
            // If updateData.status is NOT Assigned, we should remove from user
            if (updateData.status && updateData.status !== 'Assigned') {
                await updateUserAssets(oldAssignee, existingAsset, 'remove');
                // Also likely want to clear assignedTo in DB?
                // The frontend should send assignedTo: null
                if (newAssignee) {
                    // Odd case: Status Available but assignedTo present.
                    // Trust the status.
                    await updateUserAssets(newAssignee, asset, 'remove'); // Remove "allocation" record
                }
            } else if (!newAssignee) {
                await updateUserAssets(oldAssignee, existingAsset, 'remove');
            }
        }

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
