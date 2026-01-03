import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import dbConnect from '@/lib/mongodb';
import Passkey from '@/models/Passkey';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    const body = await req.json();

    const url = new URL(req.url);
    const rpID = url.hostname;
    const origin = url.origin;

    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get('webauthn_challenge')?.value;

    if (!expectedChallenge) {
        return NextResponse.json({ error: 'Challenge expired' }, { status: 400 });
    }

    await dbConnect();

    // Find credential in DB
    const passkey = await Passkey.findOne({ credentialID: body.id });
    if (!passkey) {
        return NextResponse.json({ error: 'Credential not found' }, { status: 400 });
    }

    const user = await User.findById(passkey.userId);
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential: {
                id: passkey.credentialID,
                publicKey: new Uint8Array(passkey.credentialPublicKey),
                counter: passkey.counter,
                transports: passkey.transports as any,
            },
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
        // Update counter
        passkey.counter = authenticationInfo.newCounter;
        passkey.lastUsedAt = new Date();
        await passkey.save();

        // Cleanup cookies
        cookieStore.delete('webauthn_challenge');
        cookieStore.delete('webauthn_user');

        // Generate Login Token
        const crypto = require('crypto');
        const loginToken = crypto.randomBytes(32).toString('hex');

        // Check if this is a QR Login
        if (body.qrSessionId && body.qrPin) {
            const LoginSession = (await import('@/models/LoginSession')).default;
            const session = await LoginSession.findOne({ sessionId: body.qrSessionId });

            if (session && session.pin === body.qrPin) {
                session.status = 'authenticated';
                session.userId = user._id;
                session.loginToken = loginToken;
                await session.save();
            }
        }

        // Save to user (valid for 60 seconds)
        user.webauthnLoginToken = loginToken;
        user.webauthnLoginExpires = new Date(Date.now() + 60 * 1000);
        await user.save();

        return NextResponse.json({ verified: true, loginToken });
    }

    return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 400 });
}
