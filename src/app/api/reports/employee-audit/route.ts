import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const department = searchParams.get('department');
        const addedBy = searchParams.get('addedBy');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const search = searchParams.get('search');

        // Check user permissions
        const isAdmin = session.user.role === 'admin';
        const isHR = session.user.role === 'hr';
        const isManager = session.user.role === 'manager';
        const isSuperAdmin = session.user.role === 'superadmin';
        const hasFullAccess = isAdmin || isHR || isSuperAdmin || isManager;

        // Build query
        const query: any = { organizationId: session.user.organizationId };

        if (department) {
            query.department = department;
        }

        if (addedBy) {
            query.createdBy = addedBy;
        }

        if (dateFrom || dateTo) {
            query.dateOfJoining = {};
            if (dateFrom) query.dateOfJoining.$gte = new Date(dateFrom);
            if (dateTo) query.dateOfJoining.$lte = new Date(dateTo);
        }

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } }
            ];
        }

        // Select fields based on permissions
        let selectFields = 'firstName lastName employeeId position department dateOfJoining status createdBy createdAt updatedBy updatedAt';

        if (hasFullAccess) {
            selectFields += ' email phoneNumber salaryInfo';
        }

        // Fetch employees with creator information
        const employees = await User.find(query)
            .select(selectFields)
            .populate('createdBy', 'firstName lastName email role')
            .populate('updatedBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(500);

        // Format response
        const records = employees.map(emp => {
            const baseRecord: any = {
                _id: emp._id,
                employee: {
                    _id: emp._id,
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    employeeId: emp.employeeId,
                    position: emp.position,
                    department: emp.department,
                    dateOfJoining: emp.dateOfJoining,
                    status: emp.employmentStatus || 'active'
                },
                addedAt: emp.createdAt
            };

            // Add full access fields
            if (hasFullAccess) {
                baseRecord.employee.email = emp.email;
                baseRecord.employee.phoneNumber = emp.phoneNumber;

                // Extract salary from salaryInfo.ctc (it's encrypted, so we need to handle it)
                if (emp.salaryInfo?.ctc) {
                    try {
                        // If ctc is a number string, parse it
                        baseRecord.employee.salary = parseFloat(emp.salaryInfo.ctc) || null;
                    } catch (e) {
                        baseRecord.employee.salary = null;
                    }
                } else {
                    baseRecord.employee.salary = null;
                }

                baseRecord.addedBy = emp.createdBy || {
                    _id: 'system',
                    firstName: 'System',
                    lastName: 'Admin',
                    email: 'system@company.com',
                    role: 'system'
                };
                baseRecord.lastModifiedBy = emp.updatedBy;
                baseRecord.lastModifiedAt = emp.updatedAt;
            }

            return baseRecord;
        });

        return NextResponse.json(records);

    } catch (error: any) {
        console.error('Employee audit report error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
