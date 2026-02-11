import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TaxRecord from '@/models/TaxRecord';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();

        // In a real app, you would get the userId from the session
        // const session = await getServerSession(authOptions);
        // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // For this prototype, we'll use a dummy ID or a passed ID
        const userId = data.userId || "60d0fe4f5311236168a109ca";

        // Remove userId from data to prevent overwriting it in the update
        const { userId: _, ...updateData } = data;

        const record = await TaxRecord.findOneAndUpdate(
            { userId: userId, financialYear: '2024-2025' },
            { $set: updateData },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, data: record });
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}

export async function GET(req: Request) {
    try {
        await connectDB();
        // Dummy ID for prototype
        const userId = "60d0fe4f5311236168a109ca";
        const record = await TaxRecord.findOne({ userId, financialYear: '2024-2025' });

        if (!record) {
            return NextResponse.json({ success: true, data: null });
        }

        return NextResponse.json({ success: true, data: record });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
