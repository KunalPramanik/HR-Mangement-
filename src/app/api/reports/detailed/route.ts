import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import Leave from '@/models/Leave';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date');

        // Define date range for the query (Start of day to End of day)
        const queryDate = dateParam ? new Date(dateParam) : new Date();
        const startOfDay = new Date(queryDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(queryDate);
        endOfDay.setHours(23, 59, 59, 999);

        // 1. Fetch all active employees (excluding admins/directors if needed, but let's keep them for completeness or filter by role)
        // We populate managerId to get who handles them
        const employees = await User.find({
            // Optional: filter out top level admins if desired, but user asked for "full"
        })
            .select('firstName lastName email department position role managerId profilePicture')
            .populate('managerId', 'firstName lastName');

        // 2. Fetch Attendance for this day
        const attendanceRecords = await Attendance.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        // 3. Fetch Leaves covering this day
        // Overlapping: startDate <= queryDate AND endDate >= queryDate
        // Note: Compare using startOfDay for date-only comparison logic if dates rely on 00:00
        const leaveRecords = await Leave.find({
            startDate: { $lte: endOfDay },
            endDate: { $gte: startOfDay },
            status: { $in: ['approved', 'pending'] }
        });

        // 4. Merge Data
        const report = employees.map(emp => {
            const att = attendanceRecords.find(a => a.userId.toString() === emp._id.toString());
            const leave = leaveRecords.find(l => l.userId.toString() === emp._id.toString());

            let status = 'Absent';
            let clockIn = null;
            let clockOut = null;
            let totalHours = null;
            let leaveType = null;
            let leaveStatus = null;

            if (att) {
                // FSM Logic for Report
                if (att.status === 'IN_PROGRESS') {
                    status = 'Working';
                } else {
                    // Completed
                    status = att.outcome || 'Present'; // Fallback
                }
                clockIn = att.clockIn;
                clockOut = att.clockOut;
                totalHours = att.totalHours;
            }

            if (leave) {
                // Priority: Approved Leave > Working (sometimes) > Pending Leave > Absent
                // If they clocked in but have leave (e.g. half day), show Working/Present? 
                // Usually Leave overrides absent.

                if (leave.status === 'approved') {
                    status = 'On Leave';
                } else if (!att) {
                    // Only show Pending Leave if they haven't clocked in (otherwise they are Working)
                    status = 'Pending Leave';
                }
                leaveType = leave.leaveType;
                leaveStatus = leave.status;
            }

            const managerData = emp.managerId as any;

            return {
                _id: emp._id,
                employee: {
                    name: `${emp.firstName} ${emp.lastName}`,
                    department: emp.department,
                    role: emp.role,
                    position: emp.position
                },
                manager: managerData ? `${managerData.firstName} ${managerData.lastName}` : 'Top Level',
                status,
                attendance: {
                    clockIn,
                    clockOut,
                    totalHours
                },
                leave: {
                    type: leaveType,
                    status: leaveStatus,
                    reason: leave?.reason
                }
            };
        });

        return NextResponse.json(report);

    } catch (error: unknown) {
        console.error('Report Error:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
