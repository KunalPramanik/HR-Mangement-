import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // Security Check: Only HR/Admin/Execs can create users
        if (!session || !['hr', 'admin', 'director', 'vp', 'cxo'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized: Access Denied' }, { status: 403 });
        }

        const data = await req.json();

        // Basic validation
        if (!data.firstName || !data.email || !data.department || !data.role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Auto-generate stuff
        const count = await User.countDocuments();
        const employeeId = `MS-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
        const tempPassword = 'password123';
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Map role to position if needed, or keep separate
        const userData = {
            employeeId,
            firstName: data.firstName,
            lastName: data.lastName || '',
            email: data.email,
            password: hashedPassword,
            phoneNumber: data.phoneNumber,
            department: data.department,
            role: data.role.toLowerCase(), // Ensure lowercase for enum match
            position: data.position, // Use actual job title
            managerId: data.managerId,
            hrManagerId: data.hrManagerId,
            address: data.address,
            profilePicture: data.profilePicture,
            coverPhoto: data.coverPhoto,
            documents: data.documents,
            hireDate: new Date(),
            leaveBalance: { annual: 22, sick: 10, personal: 5 }, // Defaults
            workLocation: data.workLocation,
            geoRestrictionEnabled: data.geoRestrictionEnabled,
            salaryInfo: data.salaryInfo,
            bankInfo: data.bankInfo
        };

        const newUser = await User.create(userData);

        return NextResponse.json({ success: true, user: newUser }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const simple = searchParams.get('simple');

        if (email) {
            // Allow users to fetch their own profile or if they are HR/Admin/Manager
            // For now, restrictive check:
            if (session.user.email !== email && !['hr', 'admin', 'director', 'vp', 'cxo', 'manager'].includes(session.user.role)) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            const user = await User.findOne({ email }).select('-password').populate('managerId', 'firstName lastName position');
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            const directReports = await User.find({ managerId: user._id }).select('firstName lastName position profilePicture');
            const userData = {
                ...user.toObject(),
                directReports
            };

            return NextResponse.json(userData);
        }

        if (simple === 'true') {
            // Return simplified list for dropdowns (Allowed for all auth users)
            const users = await User.find({ isActive: true }).select('_id firstName lastName role department');
            return NextResponse.json({ users });
        }

        // Full List: PROTECTED
        if (!['hr', 'admin', 'director', 'vp', 'cxo'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized: View Restricted' }, { status: 403 });
        }

        const users = await User.find({}).select('firstName lastName role employeeId position department email phoneNumber profilePicture isActive');
        return NextResponse.json(users);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
