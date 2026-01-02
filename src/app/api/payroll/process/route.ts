import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Payslip from '@/models/Payslip';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // 1. Security Check (RBAC)
        if (!session || !['admin', 'hr', 'director', 'vp', 'cxo'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized: Access Restricted' }, { status: 403 });
        }

        const { month, runType } = await req.json(); // month: "YYYY-MM"
        if (!month) return NextResponse.json({ error: 'Month is required' }, { status: 400 });

        // Date Range for Attendance Calc
        const [year, monthStr] = month.split('-');
        const startDate = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthStr), 0, 23, 59, 59);
        const daysInMonth = endDate.getDate();

        // 2. Fetch Active Employees
        const employees = await User.find({
            employmentStatus: { $in: ['active', 'notice_period', 'probation'] }
        });

        const results = {
            generated: 0,
            skipped: 0,
            errors: 0,
            details: [] as any[]
        };

        for (const emp of employees) {
            try {
                // Check if already exists (Immutability check)
                const existing = await Payslip.findOne({ userId: emp._id, month });
                if (existing) {
                    results.skipped++;
                    continue;
                }

                // 3. LOP Calculation
                // Count Absent days
                const absentCount = await Attendance.countDocuments({
                    userId: emp._id,
                    date: { $gte: startDate, $lte: endDate },
                    status: 'absent'
                });

                // TODO: Subtract approved unpaid leaves (logic simplified here)
                const lopDays = absentCount;

                // 4. Financial Calculation
                const salaryInfo = emp.salaryInfo || { ctc: 0, basic: 0, hra: 0, da: 0, pf: 0, pt: 0, deductions: 0 };

                // Fallback if no detailed structure
                if (salaryInfo.ctc === 0 && emp.salary) {
                    salaryInfo.ctc = emp.salary;
                    salaryInfo.basic = emp.salary / 24; // Monthly Basic (50% of monthly CTC)
                    // ... other mock splits
                }

                const monthlyCTC = salaryInfo.ctc / 12;

                // Per Day Pay
                const perDayPay = monthlyCTC / daysInMonth;
                const lopDeduction = Math.round(perDayPay * lopDays);

                // Statutory Calculation
                // Rule: If User has specific PF/PT set in profile (>0), use it. Otherwise, auto-calc.

                // Provident Fund (PF)
                let pf = salaryInfo.pf > 0 ? salaryInfo.pf : 0;
                if (pf === 0) {
                    // Auto-calc logic: 12% of Basic, capped at 1800 if basic > 15k (Employee Share)
                    // Note: Some companies deduct 12% of actual basic without cap. POC Standard:
                    if (salaryInfo.basic > 15000) pf = 1800;
                    else pf = Math.round(salaryInfo.basic * 0.12);
                }

                // Professional Tax (PT)
                // Rule: Default 200, but allow override (e.g., 500 in some states/months)
                const pt = salaryInfo.pt > 0 ? salaryInfo.pt : 200;


                // Tax (TDS) - Indian New Tax Regime (FY 2024-25 Estimates)
                // Slabs: 0-3L: 0%, 3-7L: 5%, 7-10L: 10%, 10-12L: 15%, 12-15L: 20%, >15L: 30%
                // Rebate 87A: Taxable income <= 7L -> No Tax.
                const annualIncome = salaryInfo.ctc;
                let annualTax = 0;

                if (annualIncome > 700000) {
                    let taxable = annualIncome; // Simplified: Assuming CTC ~= Taxable for POC (no 80C in New Regime)

                    // Standard Deduction (Rs. 50,000) - often applicable in New Regime now too
                    taxable = Math.max(0, taxable - 50000);

                    // Slab Calculation
                    if (taxable > 1500000) {
                        annualTax += (taxable - 1500000) * 0.30;
                        taxable = 1500000;
                    }
                    if (taxable > 1200000) {
                        annualTax += (taxable - 1200000) * 0.20;
                        taxable = 1200000;
                    }
                    if (taxable > 1000000) {
                        annualTax += (taxable - 1000000) * 0.15;
                        taxable = 1000000;
                    }
                    if (taxable > 700000) {
                        annualTax += (taxable - 700000) * 0.10;
                        taxable = 700000;
                    }
                    if (taxable > 300000) {
                        annualTax += (taxable - 300000) * 0.05;
                        taxable = 300000;
                    }

                    // Cess (4%)
                    annualTax = annualTax * 1.04;
                } else {
                    annualTax = 0; // Rebate u/s 87A
                }

                const tax = Math.round(annualTax / 12); // Monthly TDS

                // Total Deductions
                // Ensure no NaNs
                const safePf = pf || 0;
                const safePt = pt || 0;
                const safeDeductions = salaryInfo.deductions || 0;
                const safeLop = lopDeduction || 0;
                const safeTax = tax || 0;

                const totalDeductions = safePf + safePt + safeDeductions + safeLop + safeTax;
                const monthlyBasic = salaryInfo.basic || (monthlyCTC * 0.5);
                const monthlyAllowances = (monthlyCTC - monthlyBasic);

                // Net Pay
                const netSalary = Math.round(monthlyCTC - totalDeductions);

                // 5. Generate Payslip
                if (runType === 'commit') {
                    await Payslip.create({
                        userId: emp._id,
                        month,
                        basicSalary: Math.round(monthlyBasic),
                        hra: 0,
                        specialAllowance: 0,
                        allowances: Math.round(monthlyAllowances),
                        pf: safePf,
                        pt: safePt,
                        deductions: safeDeductions,
                        netSalary: netSalary > 0 ? netSalary : 0,
                        status: 'Pending',
                        metadata: {
                            lopDays,
                            tax: safeTax,
                            lopDeduction: safeLop
                        }
                    });

                    // 6. Audit Logging
                    await logAudit('GENERATE_PAYSLIP', session.user.id, 'Payslip', emp._id.toString(), { month, netSalary });
                }

                results.generated++;
                results.details.push({
                    name: `${emp.firstName} ${emp.lastName}`,
                    netSalary,
                    lopDays,
                    status: 'Success'
                });

            } catch (err: any) {
                console.error(`Payroll Error for ${emp.email}:`, err);
                results.errors++;
                results.details.push({
                    name: `${emp.firstName} ${emp.lastName}`,
                    error: err.message,
                    status: 'Failed'
                });
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error('Payroll Process Fatal:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
