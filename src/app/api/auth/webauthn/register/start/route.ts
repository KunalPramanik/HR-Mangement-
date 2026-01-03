import { generateRegistrationOptions } from '@simplewebauthn/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Determine RP ID from host
    const url = new URL(req.url);
    const rpID = url.hostname; // e.g., 'localhost' or 'example.com'

    // Generate registration options
    const options = await generateRegistrationOptions({
        rpName: 'Mindstar HR Portal',
        rpID,
        userID: new Uint8Array(Buffer.from(user._id.toString())),
        userName: user.email,
        attestationType: 'none',
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
        },
    });

    // Save challenge to cookie
    const cookieStore = await cookies();
    cookieStore.set('webauthn_challenge', options.challenge, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 5 // 5 minutes
    });

    return NextResponse.json(options);
}
