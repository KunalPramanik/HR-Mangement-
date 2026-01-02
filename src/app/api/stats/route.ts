import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        // 1. Total Employees
        const totalEmployees = await User.countDocuments({});

        // 2. New Employees (This Month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const newEmployees = await User.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        return NextResponse.json({
            totalEmployees,
            newEmployees
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
