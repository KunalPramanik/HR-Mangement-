import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Role from '@/models/Role';
import Settings from '@/models/Settings';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const headersList = request.headers;
        const secret = headersList.get('x-admin-secret');
        const envSecret = process.env.ADMIN_SECRET || 'dev-admin-secret'; // Fallback for dev

        if (secret !== envSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await User.deleteMany({});
        await Organization.deleteMany({});
        await Role.deleteMany({});
        await Settings.deleteMany({});

        // 1. Organization Setup
        const org = await Organization.create({
            name: 'Mindstar Tech',
            slug: 'mindstar',
            domain: 'mindstar.com',
            businessUnits: [
                { name: 'Technology', code: 'TECH' },
                { name: 'Operations', code: 'OPS' },
                { name: 'Sales & Marketing', code: 'SAM' }
            ],
            departments: [
                { name: 'Board', code: 'BOD' },
                { name: 'Executive', code: 'EXEC' },
                { name: 'Human Resources', code: 'HR' },
                { name: 'Finance', code: 'FIN' },
                { name: 'Operations', code: 'OPS' },
                { name: 'Sales', code: 'SALES' },
                { name: 'Engineering', code: 'ENG' }
            ],
            locations: [
                { name: 'Headquarters', city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata' },
                { name: 'US Office', city: 'New York', country: 'USA', timezone: 'America/New_York' }
            ],
            costCenters: [
                { name: 'General', code: '001', budget: 1000000 },
                { name: 'Tech Costs', code: '002', budget: 500000 }
            ],
            legalEntities: [
                { name: 'Mindstar Technologies Pvt Ltd', taxId: 'MST12345', country: 'India' }
            ]
        });

        // 2. Settings Setup
        await Settings.create({
            organizationId: org._id,
            branding: {
                primaryColor: '#3b82f6',
                accentColor: '#10b981',
            },
            modules: {
                payroll: { enabled: true, provider: 'Internal', autoGenerationDate: 28, currencySymbol: '$' },
                attendance: { enabled: true, biometricIntegration: false, geofencingEnabled: false, gracePeriodMinutes: 15 },
                performance: { enabled: true, reviewFrequency: 'Quarterly', visibility: { employeeCanViewPeers: false } }
            }
        });

        // 3. User & Role Helper
        const rolesMap = new Map();
        const hashedPassword = await bcrypt.hash('password123', 10);
        const usersCreated: string[] = [];

        const createRole = async (def: any) => {
            const role = new Role({
                ...def,
                organizationId: org._id,
                isSystemRole: true
            });
            await role.save();
            rolesMap.set(def.name.toLowerCase().replace(/ /g, '_'), role._id); // 'hr_admin'
            return role;
        };

        const createUser = async (data: any, roleKey: string) => {
            const roleId = rolesMap.get(roleKey);
            if (!roleId) throw new Error(`Role ID not found for ${roleKey}`);

            const user = new User({
                ...data,
                organizationId: org._id,
                roleId: roleId,
                role: roleKey.replace(/_/g, ' '), // fallback field, legacy
                password: hashedPassword
            });
            await user.save();

            // Format for reporting
            const manager = data.managerId ? "Manager" : "None";
            usersCreated.push(`[${data.employeeId}] ${user.firstName} ${user.lastName} (${user.position}) - Reports to: ${manager}`);
            return user;
        };

        // 4. Role Hierarchy Definitions
        await createRole({
            name: 'Director',
            hierarchyLevel: 4,
            permissions: [{ resource: 'all', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'configure', 'audit_view'], scope: 'organization' }],
            fieldPermissions: [{ resource: 'User', field: 'salaryInfo', visibility: 'editable' }]
        });
        await createRole({
            name: 'CXO',
            hierarchyLevel: 2,
            permissions: [{ resource: 'all', actions: ['view', 'approve'], scope: 'organization' }],
            fieldPermissions: [{ resource: 'User', field: 'salaryInfo', visibility: 'read_only' }]
        });
        await createRole({
            name: 'CHO',
            hierarchyLevel: 3,
            permissions: [{ resource: 'all', actions: ['view', 'create', 'edit', 'delete', 'approve', 'audit_view'], scope: 'organization' }],
            fieldPermissions: [{ resource: 'User', field: 'salaryInfo', visibility: 'editable' }]
        });
        await createRole({
            name: 'CFO',
            hierarchyLevel: 2,
            permissions: [{ resource: 'payroll', actions: ['view', 'edit', 'approve', 'export'], scope: 'organization' }]
        });
        await createRole({
            name: 'VP',
            hierarchyLevel: 5,
            permissions: [{ resource: 'all', actions: ['view', 'approve'], scope: 'business_unit' }]
        });
        await createRole({
            name: 'Admin', // System Admin
            hierarchyLevel: 0,
            permissions: [{ resource: 'all', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'configure'], scope: 'organization' }]
        });
        await createRole({
            name: 'HR Admin',
            hierarchyLevel: 6,
            permissions: [{ resource: 'employee', actions: ['view', 'create', 'edit'], scope: 'organization' }]
        });
        await createRole({
            name: 'Finance Admin',
            hierarchyLevel: 6,
            permissions: [{ resource: 'payroll', actions: ['view', 'edit'], scope: 'organization' }]
        });
        await createRole({
            name: 'Manager',
            hierarchyLevel: 8,
            permissions: [{ resource: 'employee', actions: ['view'], scope: 'direct_reports' }],
            fieldPermissions: [{ resource: 'User', field: 'salaryInfo', visibility: 'masked' }]
        });
        await createRole({
            name: 'Team Lead',
            hierarchyLevel: 9,
            permissions: [{ resource: 'employee', actions: ['view'], scope: 'direct_reports' }]
        });
        await createRole({
            name: 'Employee',
            hierarchyLevel: 10,
            permissions: [{ resource: 'self', actions: ['view'], scope: 'self' }]
        });
        await createRole({
            name: 'Intern',
            hierarchyLevel: 11,
            permissions: [{ resource: 'self', actions: ['view'], scope: 'self' }]
        });


        // 5. Seed Users (Top-Down)

        // Level 1: Board/Director
        const director = await createUser({
            employeeId: 'DIR001', email: 'director@mindstar.com',
            firstName: 'Diana', lastName: 'Prince',
            position: 'Director', department: 'Board', dateOfJoining: new Date('2020-01-01')
        }, 'director');

        // Level 2: C-Suite
        const cho = await createUser({
            employeeId: 'CHO001', email: 'cho@mindstar.com',
            firstName: 'Clark', lastName: 'Kent',
            position: 'Chief Human Officer', department: 'Executive', managerId: director._id, dateOfJoining: new Date('2020-01-15')
        }, 'cho');

        const cxo = await createUser({
            employeeId: 'CXO001', email: 'cxo@mindstar.com',
            firstName: 'Bruce', lastName: 'Wayne',
            position: 'Chief Experience Officer', department: 'Executive', managerId: cho._id, dateOfJoining: new Date('2020-02-01')
        }, 'cxo');

        const cfo = await createUser({
            employeeId: 'CFO001', email: 'cfo@mindstar.com',
            firstName: 'Lucius', lastName: 'Fox',
            position: 'Chief Financial Officer', department: 'Finance', managerId: director._id, dateOfJoining: new Date('2020-02-15')
        }, 'cfo');

        // Level 3: VPs
        const vpOps = await createUser({
            employeeId: 'VP001', email: 'vp@mindstar.com',
            firstName: 'Pepper', lastName: 'Potts',
            position: 'VP of Operations', department: 'Operations', managerId: cxo._id, dateOfJoining: new Date('2020-03-01')
        }, 'vp');

        // Level 4: Admins (HR/Finance/System)
        const sysAdmin = await createUser({
            employeeId: 'ADM001', email: 'admin@mindstar.com',
            firstName: 'Tony', lastName: 'Stark',
            position: 'System Administrator', department: 'Technology', managerId: cxo._id, dateOfJoining: new Date('2020-04-01')
        }, 'admin');

        const hrAdmin = await createUser({
            employeeId: 'HRA001', email: 'hradmin@mindstar.com',
            firstName: 'Natasha', lastName: 'Romanoff',
            position: 'HR Administrator', department: 'Human Resources', managerId: cho._id, dateOfJoining: new Date('2020-04-15')
        }, 'hr_admin');

        const finAdmin = await createUser({
            employeeId: 'FIN001', email: 'finance@mindstar.com',
            firstName: 'Steve', lastName: 'Rogers',
            position: 'Finance Administrator', department: 'Finance', managerId: cfo._id, dateOfJoining: new Date('2020-05-01')
        }, 'finance_admin');

        // Level 5: Managers
        const salesMgr = await createUser({
            employeeId: 'MGR001', email: 'manager@mindstar.com',
            firstName: 'Michael', lastName: 'Scott',
            position: 'Sales Manager', department: 'Sales', managerId: vpOps._id, dateOfJoining: new Date('2021-01-01')
        }, 'manager');

        const techMgr = await createUser({
            employeeId: 'MGR002', email: 'techmanager@mindstar.com',
            firstName: 'Nick', lastName: 'Fury',
            position: 'Engineering Manager', department: 'Engineering', managerId: sysAdmin._id, dateOfJoining: new Date('2021-02-01')
        }, 'manager');

        // Level 6: Team Leads
        const salesLead = await createUser({
            employeeId: 'TL001', email: 'lead@mindstar.com',
            firstName: 'Dwight', lastName: 'Schrute',
            position: 'Sales Team Lead', department: 'Sales', managerId: salesMgr._id, dateOfJoining: new Date('2021-06-01')
        }, 'team_lead');

        // Level 7: Employees
        await createUser({
            employeeId: 'EMP001', email: 'employee@mindstar.com',
            firstName: 'Jim', lastName: 'Halpert',
            position: 'Sales Representative', department: 'Sales', managerId: salesLead._id, dateOfJoining: new Date('2022-01-01')
        }, 'employee');

        await createUser({
            employeeId: 'EMP002', email: 'pam@mindstar.com',
            firstName: 'Pam', lastName: 'Beesly',
            position: 'Sales Coordinator', department: 'Sales', managerId: salesLead._id, dateOfJoining: new Date('2022-02-01')
        }, 'employee');

        // Level 8: Interns
        await createUser({
            employeeId: 'INT001', email: 'intern@mindstar.com',
            firstName: 'Peter', lastName: 'Parker',
            position: 'Sales Intern', department: 'Sales', managerId: salesLead._id, dateOfJoining: new Date('2023-01-01')
        }, 'intern');


        return NextResponse.json({
            message: 'Enterprise Hierarchy & Multi-Tenant Data Seeded Successfully',
            debug: {
                organization: org.name,
                usersCreatedCount: usersCreated.length
            },
            structure: usersCreated
        });

    } catch (error: unknown) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
