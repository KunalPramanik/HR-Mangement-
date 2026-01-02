import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import AuditLog from '@/models/AuditLog';
import Leave from '@/models/Leave';
import ApprovalRequest from '@/models/ApprovalRequest';
import User from '@/models/User';

export async function POST(req: Request) {
    const authHeader = req.headers.get('x-qa-secret');
    if (authHeader !== 'qa-super-secret-key-2025') {
        return NextResponse.json({ error: 'Unauthorized QA Access' }, { status: 403 });
    }

    await dbConnect();
    const { action, payload } = await req.json();

    try {
        switch (action) {
            case 'get_last_audit':
                const audit = await AuditLog.findOne().sort({ timestamp: -1 });
                return NextResponse.json({ audit });

            case 'get_attendance':
                const att = await Attendance.findOne({ userId: payload.userId }).sort({ date: -1 });
                return NextResponse.json({ attendance: att });

            case 'get_leave_requests':
                const leaves = await Leave.find({ userId: payload.userId }).sort({ createdAt: -1 });
                const requests = await ApprovalRequest.find({ requesterId: payload.userId }).sort({ createdAt: -1 });
                return NextResponse.json({ leaves, requests });

            case 'reset_attendance':
                await Attendance.deleteMany({ userId: payload.userId });
                return NextResponse.json({ success: true });

            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
