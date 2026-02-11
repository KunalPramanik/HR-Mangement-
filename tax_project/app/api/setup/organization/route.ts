import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Organization from "@/models/Organization";
import AuditLog from "@/models/AuditLog";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        // 1. Check if Organization already exists
        const existingOrg = await Organization.findOne({});
        if (existingOrg) {
            return NextResponse.json(
                { error: "Organization configuration already exists. Cannot re-initialize." },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { orgType, stateConfig } = body;

        // 2. Validate Root Switch Rule
        if (!['CENTRAL_GOVT', 'STATE_GOVT', 'PRIVATE'].includes(orgType)) {
            return NextResponse.json({ error: "Invalid Organization Type" }, { status: 400 });
        }

        // 3. Validate State Config Rule
        if (orgType === 'STATE_GOVT') {
            if (!stateConfig || !stateConfig.stateName || !stateConfig.stateCode) {
                return NextResponse.json(
                    { error: "State Configuration (Name, Code) is mandatory for STATE_GOVT" },
                    { status: 400 }
                );
            }
        }

        // 4. Create Organization
        const newOrg = await Organization.create({
            orgType,
            stateConfig: orgType === 'STATE_GOVT' ? stateConfig : undefined,
            configLocked: false // Will be locked after first payroll
        });

        // 5. Audit Log (Hard Rule: Every change logged)
        await AuditLog.create({
            action: 'INITIALIZE_ORG',
            entityType: 'ORG',
            entityId: newOrg._id,
            newValue: body,
            performedBy: 'SYSTEM_SETUP'
        });

        return NextResponse.json({ success: true, data: newOrg }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const org = await Organization.findOne({});
        return NextResponse.json({ data: org || null });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
