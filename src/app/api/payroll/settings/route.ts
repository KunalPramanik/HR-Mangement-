import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PayrollSettings from '@/models/PayrollSettings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { organizationId } = session.user;
        let settings = await PayrollSettings.findOne({ tenantId: organizationId });

        if (!settings) {
            // Create default
            settings = new PayrollSettings({
                tenantId: organizationId,
                updatedBy: session.user.id
            });
            await settings.save();
        }

        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !['admin', 'hr', 'cfo', 'director'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const data = await req.json();
        const { isPayrollFrozen, payPeriodStart, payPeriodEnd, taxDeductionEnabled } = data;

        let settings = await PayrollSettings.findOne({ tenantId: session.user.organizationId });

        // Create default settings if they don't exist
        if (!settings) {
            settings = new PayrollSettings({
                tenantId: session.user.organizationId,
                updatedBy: session.user.id
            });
        }

        // Audit specific changes
        if (isPayrollFrozen !== undefined && settings.isPayrollFrozen !== isPayrollFrozen) {
            await logAudit({
                actionType: 'UPDATE',
                module: 'Payroll',
                performedBy: session.user.id,
                targetDocumentId: settings._id?.toString() || 'new',
                description: `Payroll ${isPayrollFrozen ? 'FROZEN' : 'UNFROZEN'} by ${session.user.name}`,
                tenantId: session.user.organizationId,
                req
            });
        }

        if (isPayrollFrozen !== undefined) settings.isPayrollFrozen = isPayrollFrozen;
        if (payPeriodStart) settings.payPeriodStart = payPeriodStart;
        if (payPeriodEnd) settings.payPeriodEnd = payPeriodEnd;
        if (taxDeductionEnabled !== undefined) settings.taxDeductionEnabled = taxDeductionEnabled;

        settings.updatedBy = session.user.id as any;
        await settings.save();

        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
