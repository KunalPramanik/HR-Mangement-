import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Payslip from '@/models/Payslip';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let query: any = { userId: session.user.id };
        if (['hr', 'admin'].includes(session.user.role)) {
            query = {}; // Fetch all for HR/Admin
        }

        const payslips = await Payslip.find(query)
            .populate('userId', 'firstName lastName')
            .sort({ month: -1 });

        return NextResponse.json(payslips);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'hr' && session.user.role !== 'admin' && session.user.role !== 'manager')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, month } = await req.json();

        if (action === 'generate') {
            const targetMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM

            // Fetch all active employees
            const employees = await User.find({ isActive: true });

            const generated = [];
            const errors = [];

            for (const emp of employees) {
                // Check if exists
                let payslip = await Payslip.findOne({ userId: emp._id, month: targetMonth });

                // If paid, skip (don't overwrite history)
                if (payslip && payslip.status === 'Paid') continue;

                // Calculate Monthly Gross from annual CTC or salary
                const annualCTC = emp.salaryInfo?.ctc || emp.salary || 600000; // Default 6LPA if missing
                const monthlyGross = Math.round(annualCTC / 12);

                // --- Calculation Logic ---
                // 1. Basic Pay: 50% of CTC is common for optimizing HRA/PF
                const basic = Math.round(monthlyGross * 0.50);

                // 2. Metro/Non-Metro (isMetro)
                // Defaulting to true (Metro) as per request context, or read from emp
                const isMetro = emp.salaryInfo?.isMetro !== false; // Default true

                // 3. HRA: 50% of Basic (Metro) or 40% (Non-Metro)
                const hra = Math.round(basic * (isMetro ? 0.50 : 0.40));

                // 4. PF: 12% of Basic (Employer + Employee usually, but here we capture Employee share or standard projection)
                // Capping PF wage to 15000 is common but user said "Foundation for PF (12%)" on Basic.
                const pf = Math.round(basic * 0.12);

                // 5. Professional Tax (PT): Flat 200 usually
                const pt = 200;

                // 6. Special Allowance: Balancing figure
                // Gross = Basic + HRA + SpecialAllowance + (Other Allowances)
                // SpecialAllowance = MonthlyGross - (Basic + HRA) - (Others if any)
                // Note: CTC includes Employer PF, Gratuity etc. 
                // For simplified 'Gross Earnings' on payslip:
                let specialAllowance = monthlyGross - basic - hra;
                if (specialAllowance < 0) specialAllowance = 0;

                const totalEarnings = basic + hra + specialAllowance;
                const totalDeductions = pf + pt;
                const net = totalEarnings - totalDeductions;

                try {
                    const payslipData = {
                        userId: emp._id,
                        month: targetMonth,
                        basicSalary: basic,
                        hra: hra,
                        specialAllowance: specialAllowance,
                        allowances: 0,
                        pf: pf,
                        pt: pt,
                        deductions: 0,
                        netSalary: net,
                        isMetro: isMetro,
                        status: 'Pending'
                    };

                    if (payslip) {
                        // Update existing Pending payslip
                        Object.assign(payslip, payslipData);
                        await payslip.save();
                        generated.push(payslip);
                    } else {
                        // Create new
                        const newPayslip = await Payslip.create(payslipData);
                        generated.push(newPayslip);
                    }
                } catch (err: any) {
                    errors.push({ userId: emp._id, error: err.message });
                }
            }

            return NextResponse.json({
                message: `Payslip generation complete. Generated: ${generated.length}. Errors: ${errors.length}`,
                generatedCount: generated.length,
                errors
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
