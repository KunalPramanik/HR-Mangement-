import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        // Define View Permissions
        // Director/CXO/CHO/Admin/HR -> View All
        // Manager -> View Team
        // Employee -> View Self (handled elsewhere usually, but strictly restricted here)

        let userFilter = {};

        const viewerRole = session.user.role;
        const viewerId = session.user.id;

        if (['director', 'cxo', 'cho', 'admin'].includes(viewerRole)) {
            // View All - No Filter
            userFilter = { isActive: true };
        } else if (['hr', 'manager'].includes(viewerRole)) {
            // Limited View: HR, Managers see only employees/interns
            userFilter = {
                isActive: true,
                role: { $in: ['employee', 'intern'] }
            };
        } else {
            return NextResponse.json({ error: 'Permission Denied' }, { status: 403 });
        }

        const users = await User.find(userFilter).select('firstName lastName role department position profilePicture');

        // Optimize: Get attendance for these users only
        const userIds = users.map(u => u._id);
        const attendanceRecords = await Attendance.find({
            userId: { $in: userIds },
            date: { $gte: todayStart, $lte: todayEnd }
        });

        const summary = users.map(user => {
            const record = attendanceRecords.find(a => a.userId.toString() === user._id.toString());
            let displayStatus = 'not-checked-in';

            if (record) {
                if (record.status === 'IN_PROGRESS') {
                    displayStatus = 'active';
                } else if (record.status === 'COMPLETED') {
                    displayStatus = record.outcome || 'present';
                }
            }

            let breakDuration = 0;
            let meetingDuration = 0;

            if (record && record.breaks) {
                record.breaks.forEach((b: any) => {
                    const duration = b.duration || 0; // If active (no duration yet), it's 0 here
                    if (b.activity === 'break') breakDuration += duration;
                    if (b.activity === 'meeting') meetingDuration += duration;
                });
            }

            return {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                department: user.department,
                position: user.position,
                profilePicture: user.profilePicture,
                status: displayStatus,
                clockIn: record ? record.clockIn : null,
                clockOut: record ? record.clockOut : null,
                breakDuration,
                meetingDuration
            };
        });

        // Calculate Stats
        const stats = {
            total: users.length,
            present: summary.filter(s => s.status === 'active' || s.status === 'present' || s.status === 'late' || s.status === 'half-day').length,
            absent: summary.filter(s => s.status === 'absent').length,
            notCheckedIn: summary.filter(s => s.status === 'not-checked-in').length,
            activeNow: summary.filter(s => s.status === 'active').length // New specific metric
        };

        return NextResponse.json({ stats, users: summary });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
