
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Onboarding from '@/models/Onboarding';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = session.user.id;

        let onboarding = await Onboarding.findOne({ userId });

        if (!onboarding) {
            // Check if user has tenantId, if not, wait for start
            // return { status: 'Not Started' }
            return NextResponse.json({ status: 'Not Started' });
        }

        return NextResponse.json(onboarding);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = session.user.id;
        const tenantId = session.user.organizationId;

        if (!tenantId) return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });

        const body = await req.json();

        // Upsert onboarding record
        let onboarding = await Onboarding.findOne({ userId });

        if (onboarding) {
            // Update existing
            onboarding.currentStep = body.currentStep || onboarding.currentStep;
            if (body.personalDetails) onboarding.personalDetails = { ...onboarding.personalDetails, ...body.personalDetails };
            if (body.documents) onboarding.documents = body.documents; // Append or replace? Replace for simplicity
            if (body.assets) onboarding.assets = body.assets;
            if (body.bankInfo) onboarding.bankInfo = body.bankInfo;
            if (body.policyAccepted !== undefined) {
                onboarding.policyAccepted = body.policyAccepted;
                if (body.policyAccepted) onboarding.policyAcceptedAt = new Date();
            }
            if (body.status) onboarding.status = body.status;

            await onboarding.save();
        } else {
            onboarding = new Onboarding({
                userId,
                tenantId,
                status: 'In Progress',
                currentStep: body.currentStep || 1,
                ...body
            });
            await onboarding.save();
        }

        return NextResponse.json(onboarding);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
