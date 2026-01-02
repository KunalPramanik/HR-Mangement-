import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        // Allow anyone authenticated to view basic profile? Or just HR/Manager.
        // For directory, usually public readable by employees.

        // Next.js 15+ needs await params? No, in 13/14 it's object. 
        // User env is likely 14 or 15. Safe to assume standard access.
        // Wait, params is a Promise in latest Next.js.
        // But usually { params } works in signatures if not strict 15.
        // I'll check package.json -> next: "16.1.0". !!!
        // Next.js 16 (Canary? or future). params is PROMISE.

        const { id } = await params;

        const user = await User.findById(id).select('-password').populate('managerId', 'firstName lastName position');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch Direct Reports if this user manages anyone
        const directReports = await User.find({ managerId: id }).select('firstName lastName position profilePicture');

        const userData = {
            ...user.toObject(),
            directReports
        };

        return NextResponse.json(userData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        // Only HR or the user themselves (for some fields) can edit?
        // User requirement: "all database show,,value changes etc"
        // I'll allow it for now.

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Security Patch: RBAC Check (Fixing AUTH-02 & MGMT-01)
        // Only HR, Admin, Directors can edit ANY profile.
        // Users can only edit their OWN profile (and even then, we might restrict fields in the future).
        const allowedRoles = ['hr', 'admin', 'director', 'vp', 'cxo'];
        const isPrivileged = allowedRoles.includes(session.user.role);
        const isSelf = session.user.id === id;

        if (!isPrivileged && !isSelf) {
            return NextResponse.json({
                error: 'Forbidden: You do not have permission to edit this profile.'
            }, { status: 403 });
        }


        const data = await request.json();

        // Security: Prevent Privilege Escalation
        // If the user is NOT an admin/hr/director, they cannot change these fields:
        if (!isPrivileged) {
            delete data.role;
            delete data.salary; // Assuming salary is stored here or similar fields
            delete data.department;
            delete data.position; // Position might be sensitive if tied to bands
            delete data.employeeId;
            delete data.managerId;
            delete data.hrManagerId;
            // They CAN update: address, phone, bio, pictures, skills, emergencyContact
        }

        // Always prevent password update via this route (should use specific change-password route)
        delete data.password;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== 'hr' && session.user.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
