
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Job from '@/models/Job';
import Onboarding from '@/models/Onboarding';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Only Admin/Director/HR
        if (!['admin', 'director', 'hr'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const tenantId = session.user.organizationId;
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');

        if (type === 'attendance') {
            return NextResponse.json({ message: 'Attendance trends not implemented yet' });
        }

        // Default: Dashboard Summary
        const totalEmployees = await User.countDocuments({ organizationId: tenantId, isActive: true });

        // Count users who have attendance record today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Attendance model has tenantId.
        const presentToday = await Attendance.countDocuments({
            tenantId,
            date: { $gte: startOfDay },
            status: { $in: ['Present', 'Late'] }
        });

        const activeJobs = await Job.countDocuments({ tenantId, status: 'Open' });
        const pendingOnboarding = await Onboarding.countDocuments({ tenantId, status: 'In Progress' });

        // Payroll Estimate skipped due to encrypted fields
        const monthlyPayroll = 0;

        return NextResponse.json({
            totalEmployees,
            presentToday,
            activeJobs,
            pendingOnboarding,
            monthlyPayroll,
            attendanceRate: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
