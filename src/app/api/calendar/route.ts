import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Leave from '@/models/Leave';
import Holiday from '@/models/Holiday';
import Announcement from '@/models/Announcement';
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
        const startStr = searchParams.get('start');
        const endStr = searchParams.get('end');

        let dateFilter = {};
        if (startStr && endStr) {
            // Basic optimization: filter by date range if provided
            // However, for leaves spanning months, we need to be careful.
            // Simplified: Fetch all for now or current month +/- 1.
            // Use ISO string comparison or Date objects.
            const startDate = new Date(startStr);
            const endDate = new Date(endStr);

            // This is a loose filter, might need refinement for large datasets
            dateFilter = {
                $or: [
                    { date: { $gte: startDate, $lte: endDate } }, // Holidays
                    { startDate: { $lte: endDate }, endDate: { $gte: startDate } }, // Leaves overlap
                    { publishedAt: { $gte: startDate, $lte: endDate } } // Announcements
                ]
            };
        }

        // 1. Fetch Holidays
        const holidays = await Holiday.find({});

        // 2. Fetch Approved Leaves
        const leaves = await Leave.find({ status: 'approved' })
            .populate('userId', 'firstName lastName profilePicture');

        // 3. Fetch Event Announcements
        const events = await Announcement.find({ category: 'event', isPublished: true });

        // Normalize Data
        const calendarEvents: any[] = [];

        // Map Holidays
        holidays.forEach(h => {
            calendarEvents.push({
                id: h._id,
                title: h.name,
                start: h.date,
                end: h.date,
                type: 'holiday',
                details: h.description
            });
        });

        // Map Leaves
        leaves.forEach(l => {
            // @ts-ignore
            const userName = l.userId ? `${l.userId.firstName} ${l.userId.lastName}` : 'Unknown User';

            calendarEvents.push({
                id: l._id,
                title: `${userName} - ${l.leaveType} Leave`,
                start: l.startDate,
                end: l.endDate,
                type: 'leave',
                user: l.userId,
                details: l.reason
            });
        });

        // Map Events
        events.forEach(e => {
            calendarEvents.push({
                id: e._id,
                title: e.title,
                start: e.publishedAt || e.createdAt,
                end: e.expiresAt || e.publishedAt || e.createdAt,
                type: 'event',
                details: e.content
            });
        });

        return NextResponse.json(calendarEvents);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
