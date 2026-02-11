import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Employee from "@/models/Employee";
import Organization from "@/models/Organization";
import AuditLog from "@/models/AuditLog";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        // 1. Check if Org is configured
        const org = await Organization.findOne({});
        if (!org) {
            return NextResponse.json({ error: "Organization not configured. Please setup organization first." }, { status: 400 });
        }

        const body = await req.json();

        // 2. Validate Compulsory Fields (Hard Rules)
        const { fullName, pan, dateOfJoining, employmentType, payStructure, bankDetails } = body;

        // PAN Regex Check (Double check even though model has it, for custom error message)
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!pan || !panRegex.test(pan)) {
            return NextResponse.json({ error: "Invalid PAN format. Must be ABCDE1234F" }, { status: 400 });
        }

        // Auto-generate Employee ID (Simple sequential or random for now, but immutable)
        const employeeCount = await Employee.countDocuments();
        const employeeId = `EMP${(employeeCount + 1).toString().padStart(4, '0')}`;

        // 3. Create Employee
        const newEmployee = new Employee({
            employeeId, // Auto-generated
            fullName,
            pan,
            dateOfJoining,
            employmentType,
            payStructure,
            bankDetails,
            orgId: org._id
        });

        await newEmployee.save();

        // 4. Audit Log
        await AuditLog.create({
            action: 'ADD_EMPLOYEE',
            entityType: 'EMPLOYEE',
            entityId: newEmployee.employeeId,
            newValue: body,
            performedBy: 'PAYROLL_OPERATOR' // In a real app, this would be session user
        });

        return NextResponse.json({ success: true, data: newEmployee }, { status: 201 });

    } catch (error: any) {
        // Handle Duplicate Key Error (E11000)
        if (error.code === 11000) {
            return NextResponse.json({ error: "Duplicate PAN or Employee ID detected." }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const employees = await Employee.find({ status: 'ACTIVE' });
        return NextResponse.json({ data: employees });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
