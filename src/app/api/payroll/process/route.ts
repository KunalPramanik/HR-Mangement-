import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PayrollSettings from '@/models/PayrollSettings';
import User from '@/models/User';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // Only Admin or CFO can run payroll
        if (!session || !['admin', 'cfo', 'hr'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { organizationId } = session.user;

        // 1. Check if Payroll is Frozen
        const settings = await PayrollSettings.findOne({ tenantId: organizationId });
        if (settings?.isPayrollFrozen) {
            return NextResponse.json({
                error: 'Payroll is currently FROZEN. Cannot process payments.',
                code: 'PAYROLL_FROZEN'
            }, { status: 403 });
        }

        // 2. Simulate Payroll Processing
        const data = await req.json();
        const { month, year } = data;

        if (!month || !year) {
            return NextResponse.json({ error: 'Month and year required' }, { status: 400 });
        }

        // Fetch eligible employees
        const employees = await User.find({
            organizationId,
            isActive: true,
            // employmentStatus: 'active' // Add if implemented
        }).select('_id firstName lastName salaryInfo bankInfo');

        // Mock Calculation
        const payrollRun = {
            totalEmployees: employees.length,
            totalPayout: employees.reduce((acc, emp) => {
                const net = parseFloat(emp.salaryInfo?.netSalary || '0');
                return acc + (isNaN(net) ? 0 : net);
            }, 0),
            status: 'Processed',
            processedAt: new Date(),
            processedBy: session.user.id
        };

        // Audit Logging
        await logAudit({
            actionType: 'CREATE',
            module: 'Payroll',
            performedBy: session.user.id,
            targetDocumentId: `RUN-${month}-${year}`,
            description: `Processed payroll for ${month} ${year}. Total: $${payrollRun.totalPayout}`,
            tenantId: organizationId,
            req
        });

        return NextResponse.json({
            success: true,
            message: `Payroll processed for ${month} ${year}`,
            data: payrollRun
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
