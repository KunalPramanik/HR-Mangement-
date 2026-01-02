import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        // 1. Total Active Employees
        const totalEmployees = await User.countDocuments({ isActive: true });

        if (totalEmployees === 0) {
            return NextResponse.json({ avgAttendance: 0, absentToday: 0, totalEmployees: 0 });
        }

        // 2. Attendance Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const attendanceToday = await Attendance.countDocuments({
            date: { $gte: startOfDay }
        });

        // 3. Calculations
        const absentToday = totalEmployees - attendanceToday;
        const avgAttendance = Math.round((attendanceToday / totalEmployees) * 100);

        return NextResponse.json({
            avgAttendance,
            absentToday,
            presentToday: attendanceToday,
            totalEmployees
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
