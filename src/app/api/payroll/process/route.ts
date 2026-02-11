import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Payslip from '@/models/Payslip';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { calculateTax } from '@/lib/taxCalculator';

export async function POST(req: Request) {
    try {
        const mongoose = await dbConnect();
        const session = await getServerSession(authOptions);

        // 1. Security Check (RBAC)
        if (!session || !['admin', 'hr', 'director', 'vp', 'cxo'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized: Access Restricted' }, { status: 403 });
        }

        const { month, runType } = await req.json(); // month: "YYYY-MM"
        if (!month) return NextResponse.json({ error: 'Month is required' }, { status: 400 });

        // Date Range for Attendance Calc
        const [yearStr, monthStr] = month.split('-');
        const year = parseInt(yearStr);
        const monthIndex = parseInt(monthStr) - 1;
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);
        const daysInMonth = endDate.getDate();

        // Transaction Start
        const dbSession = await mongoose.startSession();
        dbSession.startTransaction();

        try {
            // 2. Bulk Fetch Active Employees
            const employees = await User.find({
                employmentStatus: { $in: ['active', 'notice_period', 'probation'] }
            }).session(dbSession);

            if (employees.length === 0) {
                await dbSession.abortTransaction();
                return NextResponse.json({ success: true, results: { generated: 0, skipped: 0, errors: 0, details: [] } });
            }

            const employeeIds = employees.map(e => e._id);

            // 3. Bulk Fetch Existing Payslips (Check for Duplicates)
            const existingPayslips = await Payslip.find({
                userId: { $in: employeeIds },
                month
            }).session(dbSession).select('userId');

            const existingUserIds = new Set(existingPayslips.map(p => p.userId.toString()));

            // 4. Bulk Aggregate Attendance (Calculate Absent Days)
            // Group by userId and count absent records
            const attendanceStats = await Attendance.aggregate([
                {
                    $match: {
                        userId: { $in: employeeIds },
                        date: { $gte: startDate, $lte: endDate },
                        status: 'absent' // Count only absent days for LOP
                    }
                },
                {
                    $group: {
                        _id: '$userId',
                        absentCount: { $sum: 1 }
                    }
                }
            ]).session(dbSession);

            const attendanceMap = new Map();
            attendanceStats.forEach(stat => {
                attendanceMap.set(stat._id.toString(), stat.absentCount);
            });

            const results = {
                generated: 0,
                skipped: 0,
                errors: 0,
                details: [] as any[]
            };

            const newPayslips = [];
            const auditLogs = [];

            for (const emp of employees) {
                try {
                    // Check if already exists (Immutability check)
                    if (existingUserIds.has(emp._id.toString())) {
                        results.skipped++;
                        continue;
                    }

                    // LOP Calculation
                    const absentCount = attendanceMap.get(emp._id.toString()) || 0;
                    // TODO: Logic to subtract approved unpaid leaves could be added here
                    const lopDays = absentCount;

                    // Financial Calculation
                    const salaryInfo = emp.salaryInfo || { ctc: 0, basic: 0, hra: 0, da: 0, pf: 0, pt: 0, deductions: 0 };

                    // Fallback if no detailed structure
                    if (salaryInfo.ctc === 0 && emp.salary) {
                        salaryInfo.ctc = emp.salary;
                        salaryInfo.basic = emp.salary / 24; // Monthly Basic (50% of monthly CTC)
                    }

                    const monthlyCTC = salaryInfo.ctc / 12;

                    // Per Day Pay
                    const perDayPay = monthlyCTC / daysInMonth;
                    const lopDeduction = Math.round(perDayPay * lopDays);

                    // Statutory Calculation
                    // PF
                    let pf = salaryInfo.pf > 0 ? salaryInfo.pf : 0;
                    if (pf === 0) {
                        if (salaryInfo.basic > 15000) pf = 1800;
                        else pf = Math.round(salaryInfo.basic * 0.12);
                    }

                    // PT
                    const pt = salaryInfo.pt > 0 ? salaryInfo.pt : 200;

                    // Tax (TDS) using Utility
                    const taxResult = calculateTax(salaryInfo.ctc);
                    const annualTax = taxResult.tax;
                    const tax = Math.round(annualTax / 12); // Monthly TDS

                    // Total Deductions
                    const safePf = pf || 0;
                    const safePt = pt || 0;
                    const safeDeductions = salaryInfo.deductions || 0; // Other deductions
                    const safeLop = lopDeduction || 0;
                    const safeTax = tax || 0;

                    const totalDeductions = safePf + safePt + safeDeductions + safeLop + safeTax;
                    const monthlyBasic = salaryInfo.basic || (monthlyCTC * 0.5);
                    const monthlyAllowances = (monthlyCTC - monthlyBasic);

                    // Net Pay
                    const netSalary = Math.round(monthlyCTC - totalDeductions);

                    if (runType === 'commit') {
                        newPayslips.push({
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

                        auditLogs.push({
                            action: 'GENERATE_PAYSLIP',
                            performerId: session.user.id,
                            resourceType: 'Payslip',
                            targetId: emp._id.toString(), // We'll log the User ID
                            changes: { month, netSalary },
                            timestamp: new Date()
                        });
                    }

                    results.generated++;
                    results.details.push({
                        name: `${emp.firstName} ${emp.lastName}`,
                        netSalary,
                        lopDays,
                        status: 'Success'
                    });

                } catch (err: unknown) {
                    console.error(`Payroll Error for ${emp.email}:`, err);
                    const errMsg = err instanceof Error ? err.message : String(err);
                    results.errors++;
                    results.details.push({
                        name: `${emp.firstName} ${emp.lastName}`,
                        error: errMsg,
                        status: 'Failed'
                    });
                    // Note: In strict transaction mode, one error could abort all.
                    // Or we can log this specific failure but commit the rest if partial success is allowed.
                    // User requested "Rollback if even one error occurs".
                    throw err; // Trigger rollback
                }
            }

            if (runType === 'commit' && newPayslips.length > 0) {
                await Payslip.insertMany(newPayslips, { session: dbSession });
                // Note: Audit logs are simpler without session or we loop insert (InsertMany not supported for audit usually if schema differs? No, insertMany works for any model if array is correct)
                // However, AuditLogs might not be critical to rollback? Let's keep it simple.
                // We'll log audits asynchronously after commit or sequential.
            }

            await dbSession.commitTransaction();

            // Post-transaction Logging (Non-blocking)
            if (runType === 'commit' && auditLogs.length > 0) {
                // logAudit helper handles individual inserts usually. We can batch it if we modify logAudit or loop.
                // For now, simple loop (detached from critical path)
                Promise.all(auditLogs.map(log => logAudit(log.action, log.performerId, log.resourceType, log.targetId, log.changes))).catch(console.error);
            }

            return NextResponse.json({ success: true, results });

        } catch (error) {
            await dbSession.abortTransaction();
            throw error;
        } finally {
            dbSession.endSession();
        }

    } catch (error: unknown) {
        console.error('Payroll Process Fatal:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
