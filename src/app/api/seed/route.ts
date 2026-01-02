import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await dbConnect();

        // 1. Clear existing users for a clean hierarchy setup
        await User.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);
        const usersCreated = [];

        // --- LEVEL 1: DIRECTOR (Top) ---
        const director = await User.create({
            employeeId: 'DIR001',
            email: 'director@mindstar.com',
            password: hashedPassword,
            firstName: 'Diana',
            lastName: 'Prince',
            role: 'director',
            department: 'Board',
            position: 'Director',
            hireDate: new Date('2020-01-01'),
            isActive: true,
        });
        usersCreated.push(`${director.role}: ${director.firstName}`);

        // --- LEVEL 2: CHO (Reports to Director) ---
        const cho = await User.create({
            employeeId: 'CHO001',
            email: 'cho@mindstar.com',
            password: hashedPassword,
            firstName: 'Clark',
            lastName: 'Kent',
            role: 'cho',
            department: 'Executive',
            position: 'Chief Human Officer',
            managerId: director._id, // <<--- Reports to Director
            hireDate: new Date('2020-02-01'),
            isActive: true,
        });
        usersCreated.push(`${cho.role}: ${cho.firstName} (Reports to ${director.firstName})`);

        // --- LEVEL 3: CXO (Reports to CHO) ---
        const cxo = await User.create({
            employeeId: 'CXO001',
            email: 'cxo@mindstar.com',
            password: hashedPassword,
            firstName: 'Bruce',
            lastName: 'Wayne',
            role: 'cxo',
            department: 'Executive',
            position: 'Chief Experience Officer',
            managerId: cho._id, // <<--- Reports to CHO
            hireDate: new Date('2020-03-01'),
            isActive: true,
        });
        usersCreated.push(`${cxo.role}: ${cxo.firstName} (Reports to ${cho.firstName})`);

        // --- LEVEL 4: ADMIN (Reports to CXO) ---
        // Note: Admin usually is system wide, but in this chain we place them here
        const admin = await User.create({
            employeeId: 'ADM001',
            email: 'admin@mindstar.com',
            password: hashedPassword,
            firstName: 'Alice',
            lastName: 'Wonder',
            role: 'admin',
            department: 'Operations',
            position: 'System Administrator',
            managerId: cxo._id, // <<--- Reports to CXO
            hireDate: new Date('2021-01-01'),
            isActive: true,
        });
        usersCreated.push(`${admin.role}: ${admin.firstName} (Reports to ${cxo.firstName})`);

        // --- LEVEL 5: HR (Reports to Admin) ---
        const hr = await User.create({
            employeeId: 'HR001',
            email: 'hr@mindstar.com',
            password: hashedPassword,
            firstName: 'Helen',
            lastName: 'Ross',
            role: 'hr',
            department: 'Human Resources',
            position: 'HR Manager',
            managerId: admin._id, // <<--- Reports to Admin
            hireDate: new Date('2021-06-01'),
            isActive: true,
        });
        usersCreated.push(`${hr.role}: ${hr.firstName} (Reports to ${admin.firstName})`);

        // --- LEVEL 6: MANAGER (Reports to HR... or usually Dept Head, but following chain) ---
        const manager = await User.create({
            employeeId: 'MGR001',
            email: 'manager@mindstar.com',
            password: hashedPassword,
            firstName: 'Michael',
            lastName: 'Scott',
            role: 'manager',
            department: 'Sales',
            position: 'Sales Manager',
            managerId: hr._id, // <<--- Reports to HR
            hireDate: new Date('2022-01-01'),
            isActive: true,
        });
        usersCreated.push(`${manager.role}: ${manager.firstName} (Reports to ${hr.firstName})`);

        // --- LEVEL 7: EMPLOYEE (Reports to Manager) ---
        const employee = await User.create({
            employeeId: 'EMP001',
            email: 'employee@mindstar.com',
            password: hashedPassword,
            firstName: 'Jim',
            lastName: 'Halpert',
            role: 'employee',
            department: 'Sales',
            position: 'Sales Representative',
            managerId: manager._id, // <<--- Reports to Manager
            hireDate: new Date('2023-01-01'),
            isActive: true,
        });
        usersCreated.push(`${employee.role}: ${employee.firstName} (Reports to ${manager.firstName})`);

        // --- LEVEL 8: INTERN (Reports to Employee/Manager) ---
        // Let's make Intern report to Employee (Mentor)
        const intern = await User.create({
            employeeId: 'INT001',
            email: 'intern@mindstar.com',
            password: hashedPassword,
            firstName: 'Peter',
            lastName: 'Parker',
            role: 'intern',
            department: 'Sales',
            position: 'Sales Intern',
            managerId: employee._id, // <<--- Reports to Employee
            hireDate: new Date('2024-06-01'),
            isActive: true,
        });
        usersCreated.push(`${intern.role}: ${intern.firstName} (Reports to ${employee.firstName})`);


        return NextResponse.json({
            message: 'Hierarchy Created Successfully',
            structure: usersCreated,
            credentials: { password: 'password123' }
        });

    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
