import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Leave from '@/models/Leave';
import Resignation from '@/models/Resignation';
import Attendance from '@/models/Attendance';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfDay, endOfDay, startOfMonth } from 'date-fns';

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        const allowedRoles = ['director', 'cxo', 'cho', 'vp', 'admin', 'hr'];
        if (!session || !allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());
        const monthStart = startOfMonth(new Date());

        // Parallel Data Fetching
        const [
            totalEmployees,
            newHires,
            pendingLeaves,
            pendingResignations,
            attendanceToday,
            departmentStats
        ] = await Promise.all([
            User.countDocuments({ isActive: true }),
            User.countDocuments({ isActive: true, hireDate: { $gte: monthStart } }),
            Leave.countDocuments({ status: 'pending' }),
            Resignation.countDocuments({ status: 'pending' }),
            Attendance.countDocuments({ date: { $gte: todayStart, $lte: todayEnd }, status: { $in: ['present', 'late', 'half-day'] } }),
            User.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$department', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);

        return NextResponse.json({
            headcount: {
                total: totalEmployees,
                newThisMonth: newHires
            },
            requests: {
                leaves: pendingLeaves,
                resignations: pendingResignations
            },
            attendance: {
                present: attendanceToday
            },
            departments: departmentStats.map((d: any) => ({ name: d._id || 'Unassigned', count: d.count }))
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
