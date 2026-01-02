export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Leave from '@/models/Leave';
import Attendance from '@/models/Attendance';
import Ticket from '@/models/Ticket';
import Announcement from '@/models/Announcement';
import Performance from '@/models/Performance';
import Project from '@/models/Project';
import Notification from '@/models/Notification';

export async function DELETE() {
    try {
        await dbConnect();

        // Wipe everything except maybe the structure? No, wipe data.
        await User.deleteMany({});
        await Leave.deleteMany({});
        await Attendance.deleteMany({});
        await Ticket.deleteMany({});
        await Announcement.deleteMany({});
        await Performance.deleteMany({});
        await Project.deleteMany({});
        await Notification.deleteMany({});

        return NextResponse.json({ message: 'All system data has been wiped successfully.' });
    } catch (error: unknown) {
        console.error('Reset failed:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
