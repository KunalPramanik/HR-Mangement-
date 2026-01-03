import { generateAuthenticationOptions } from '@simplewebauthn/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Passkey from '@/models/Passkey';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    const { email } = await req.json();

    await dbConnect();

    // If email provided, find user and their passkeys
    let allowCredentials;
    let user;

    if (email) {
        user = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { employeeId: email }]
        });

        if (user) {
            const passkeys = await Passkey.find({ userId: user._id });
            allowCredentials = passkeys.map(pk => ({
                id: pk.credentialID,
                transports: pk.transports,
            }));
        }
    }

    // Determine RP ID
    const url = new URL(req.url);
    const rpID = url.hostname;

    const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: allowCredentials as any, // Cast to any to avoid type strictness issues with Buffer <-> string
        userVerification: 'preferred',
    });

    // Save challenge
    const cookieStore = await cookies();
    cookieStore.set('webauthn_challenge', options.challenge, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 5
    });

    // Also save the user ID if we found one, to verify against later
    if (user) {
        cookieStore.set('webauthn_user', user._id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 5
        });
    }

    return NextResponse.json(options);
}
