import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/encryption';
import { logAudit } from '@/lib/audit';

// Helper to decrypt a user document
function decryptUser(userDoc: any) {
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;

    if (user.salaryInfo) {
        for (const k in user.salaryInfo) {
            if (typeof user.salaryInfo[k] === 'string') {
                user.salaryInfo[k] = decrypt(user.salaryInfo[k]);
            }
        }
    }
    if (user.bankInfo) {
        for (const k in user.bankInfo) {
            user.bankInfo[k] = decrypt(user.bankInfo[k]);
        }
    }
    if (user.statutoryInfo) {
        for (const k in user.statutoryInfo) {
            if (k !== 'pfEnabled') user.statutoryInfo[k] = decrypt(user.statutoryInfo[k]);
        }
    }
    if (user.aadhaar) user.aadhaar = decrypt(user.aadhaar);

    return user;
}

// Helper to encrypt incoming data
function encryptData(data: any) {
    const encrypted = { ...data };

    if (data.salaryInfo) {
        encrypted.salaryInfo = {};
        for (const k in data.salaryInfo) {
            encrypted.salaryInfo[k] = encrypt(String(data.salaryInfo[k]));
        }
    }
    if (data.bankInfo) {
        encrypted.bankInfo = {};
        for (const k in data.bankInfo) {
            encrypted.bankInfo[k] = encrypt(String(data.bankInfo[k]));
        }
    }
    if (data.statutoryInfo) {
        encrypted.statutoryInfo = { ...data.statutoryInfo };
        for (const k in data.statutoryInfo) {
            if (k !== 'pfEnabled' && data.statutoryInfo[k]) {
                encrypted.statutoryInfo[k] = encrypt(String(data.statutoryInfo[k]));
            }
        }
    }
    if (data.aadhaar) encrypted.aadhaar = encrypt(String(data.aadhaar));

    return encrypted;
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const user = await User.findById(id).select('-password').populate('managerId', 'firstName lastName position');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Access Control
        const isSelf = session.user.id === id;
        const isManager = session.user.id === user.managerId?.toString();
        const isAdmin = ['admin', 'hr', 'director', 'vp', 'cxo', 'cfo', 'cho'].includes(session.user.role);

        let userData = user.toObject();

        if (isSelf || isAdmin) {
            // Decrypt sensitive data
            userData = decryptUser(user);
        } else if (isManager) {
            // Remove sensitive data
            delete userData.salaryInfo;
            delete userData.bankInfo;
            delete userData.statutoryInfo;
            delete userData.aadhaar;
            delete userData.passportDetails;
        } else {
            // Public/Colleague View (Basic only)
            // Even stricter
            return NextResponse.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                position: user.position,
                department: user.department,
                email: user.email,
                profilePicture: user.profilePicture
            });
        }

        const directReports = await User.find({ managerId: id }).select('firstName lastName position department isActive profilePicture status'); // Status from where? User model doesn't have status, but has 'isActive'. 
        // Maybe fetch Attendance status? For now just basics.

        return NextResponse.json({ ...userData, directReports });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const data = await request.json();

        // RBAC Check
        const isSelf = session.user.id === id;
        const isAdmin = ['admin', 'hr', 'director', 'vp', 'cxo', 'cho'].includes(session.user.role);

        if (!isSelf && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (!isAdmin) {
            // Self: Prevent editing core fields
            const forbidden = ['role', 'roleId', 'salaryInfo', 'department', 'position', 'employeeId', 'managerId', 'dateOfJoining', 'isActive', 'organizationId'];
            forbidden.forEach(f => delete data[f]);
        }

        delete data.password; // Never update password here

        // Encrypt Sensitive Data
        const encryptedData = encryptData(data);

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: encryptedData },
            { new: true, runValidators: true }
        ).select('-password');

        // Log Audit
        await logAudit({
            actionType: 'UPDATE',
            module: 'User',
            performedBy: session.user.id,
            targetDocumentId: id,
            targetUser: id,
            description: `Updated profile for ${updatedUser?.firstName} ${updatedUser?.lastName}`,
            tenantId: session.user.organizationId,
            req: request
        });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
