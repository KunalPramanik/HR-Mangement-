
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tenantId = session.user.organizationId;
        if (!tenantId) return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });

        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');

        let query: any = { tenantId };
        if (jobId) {
            query.jobId = jobId;
        }

        const candidates = await Candidate.find(query)
            .populate('jobId', 'title department') // Populate job details
            .sort({ appliedAt: -1 });

        return NextResponse.json(candidates);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const tenantId = session.user.organizationId;

        if (!tenantId) return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });

        // Basic validation
        if (!body.firstName || !body.lastName || !body.email || !body.jobId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const candidate = new Candidate({
            ...body,
            tenantId,
            stage: 'Sourced', // Start at Sourced
            appliedAt: new Date()
        });
        await candidate.save();

        // Add candidate to Job's applicants list
        const Job = (await import('@/models/Job')).default;
        await Job.findByIdAndUpdate(body.jobId, {
            $push: { applicants: candidate._id }
        });

        return NextResponse.json(candidate, { status: 201 });
    } catch (error: any) {
        // Handle duplicate email application for same job
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Candidate has already applied for this job' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
