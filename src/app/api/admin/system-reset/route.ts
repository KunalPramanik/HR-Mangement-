import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Payslip from '@/models/Payslip';
import Leave from '@/models/Leave';
import PerformanceReview from '@/models/Performance'; // Check exact export name
import RegularizationRequest from '@/models/RegularizationRequest';
import AuditLog from '@/models/AuditLog';
import Announcement from '@/models/Announcement';
import Ticket from '@/models/Ticket';
import Project from '@/models/Project';
import Goal from '@/models/Goal';
// Import other models as needed

export async function DELETE(req: Request) {
    try {
        await dbConnect();

        // Security: In a real app, strict checks here. 
        // For POC/Seed clearing, we might allow it if it's a dev environment or specific admin.
        // Assuming this is a "Hard Reset" request from the user.

        // Uncomment to enforce Admin session (Recommended even for tools)
        // const session = await getServerSession(authOptions);
        // if (!session || session.user.role !== 'admin') {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        // }

        const results = {
            users: await User.deleteMany({}),
            attendance: await Attendance.deleteMany({}),
            payslips: await Payslip.deleteMany({}),
            leaves: await Leave.deleteMany({}),
            regularization: await RegularizationRequest.deleteMany({}),
            audits: await AuditLog.deleteMany({}),
            announcements: await Announcement.deleteMany({}),
            tickets: await Ticket.deleteMany({}),
            projects: await Project.deleteMany({}),
            goals: await Goal.deleteMany({}),
            // Add others if necessary
        };

        return NextResponse.json({
            success: true,
            message: 'All system data has been wiped.',
            details: results
        });

    } catch (error: any) {
        console.error('Reset Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
