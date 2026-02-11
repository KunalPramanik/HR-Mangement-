import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await User.findById(session.user.id).select('-password');
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json(user);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { phoneNumber, address, avatar, skills, certifications, emergencyContact } = body;

        // Only allow updating specific fields
        const updateData: any = {};
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (address !== undefined) updateData.address = address;
        if (avatar !== undefined) updateData.profilePicture = avatar;
        if (skills !== undefined) updateData.skills = skills;
        if (certifications !== undefined) updateData.certifications = certifications;
        if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;

        const user = await User.findByIdAndUpdate(
            session.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        return NextResponse.json(user);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
