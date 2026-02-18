import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PerformanceReview from '@/models/PerformanceReview';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const review = await PerformanceReview.findById(params.id)
            .populate('employeeId', 'firstName lastName position department profilePicture')
            .populate('managerId', 'firstName lastName profilePicture');

        if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

        // Access Control
        const isSelf = session.user.id === review.employeeId._id.toString();
        const isManager = session.user.id === review.managerId?._id.toString();
        const isAdmin = ['admin', 'hr', 'cho', 'vp', 'cxo'].includes(session.user.role);

        if (!isSelf && !isManager && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(review);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const review = await PerformanceReview.findById(id);
        if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

        const isSelf = session.user.id === review.employeeId.toString();
        const isManager = session.user.id === review.managerId?.toString();
        const isAdmin = ['admin', 'hr', 'cho'].includes(session.user.role); // Admins can override

        const data = await req.json();

        // Workflow State Machine (Simple for MVP)
        // Self-Assessment -> Manager-Review -> Closed
        // Mongoose Enum: ['Self-Assessment', 'Manager-Review', 'Director-Approval', 'Discussed', 'Closed']

        if (isSelf) {
            if (review.status !== 'Self-Assessment' && !isAdmin) {
                // Usually self-review locked after submit
            }

            // Map 'selfAssessment' to flat fields
            if (data.selfAssessment) {
                if (data.selfAssessment.achievements) review.achievements = data.selfAssessment.achievements;
                if (data.selfAssessment.areasOfImprovement) review.areasOfImprovement = data.selfAssessment.areasOfImprovement;
                if (data.selfAssessment.goals) review.goalsForNextPeriod = data.selfAssessment.goals;
                if (data.selfAssessment.rating) review.selfRating = data.selfAssessment.rating;
            }

            if (data.status === 'Submitted') {
                review.status = 'Manager-Review';
            }
        }
        else if (isManager) {
            if (review.status !== 'Manager-Review' && !isAdmin) {
                // return NextResponse.json({ error: 'Not in Manager-Review stage' }, { status: 400 });
            }

            // Map 'managerFeedback' to flat fields
            if (data.managerFeedback) {
                if (data.managerFeedback.rating) review.managerRating = data.managerFeedback.rating;
                if (data.managerFeedback.comments) review.managerComments = data.managerFeedback.comments;
            }

            if (data.status === 'Completed' || data.status === 'Closed') {
                review.status = 'Closed';
                review.completedAt = new Date();
            } else if (data.status === 'Director-Approval') {
                review.status = 'Director-Approval';
            }
        }

        // Admin overrides for final scores
        if (isAdmin) {
            if (data.finalRating) review.finalScore = data.finalRating;
            if (data.status) review.status = data.status;
        }

        await review.save();

        await logAudit({
            actionType: 'UPDATE',
            module: 'Review',
            performedBy: session.user.id,
            targetDocumentId: id,
            description: `Updated review (Status: ${review.status})`,
            tenantId: session.user.organizationId,
            req
        });

        return NextResponse.json(review);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
