import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const settings = await (Settings as any).getSettings(); // Use helper
        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // Only Admin/Director/CXO/CHO can update settings? Usually Admin only.
        if (!session || !['admin', 'cxo', 'cho'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();

        // Update
        // Note: For singleton, we usually just update the one document found.
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings(body);
        } else {
            Object.assign(settings, body);
        }

        settings.updatedBy = new mongoose.Types.ObjectId(session.user.id);
        await settings.save();

        return NextResponse.json(settings);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
