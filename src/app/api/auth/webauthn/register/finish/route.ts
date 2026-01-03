import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Passkey from '@/models/Passkey';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // specific rpID
    const url = new URL(req.url);
    const rpID = url.hostname;

    // Retrieve challenge from cookie
    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get('webauthn_challenge')?.value;

    if (!expectedChallenge) {
        return NextResponse.json({ error: 'Challenge expired or not found' }, { status: 400 });
    }

    let verification;
    try {
        verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: url.origin, // e.g. http://localhost:3000
            expectedRPID: rpID,
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { verified, registrationInfo } = verification as any;

    if (verified && registrationInfo) {
        const { credentialPublicKey, credentialID, counter } = registrationInfo;

        // Save to DB
        await dbConnect();

        // Check if credential ID already exists
        const existing = await Passkey.findOne({ credentialID });
        if (existing) {
            return NextResponse.json({ error: 'Authenticator already registered' }, { status: 400 });
        }

        await Passkey.create({
            userId: session.user.id,
            credentialID,
            credentialPublicKey: Buffer.from(credentialPublicKey),
            counter,
            transports: body.response.transports || [],
            deviceName: 'Biometric Authenticator', // Could parse User-Agent
        });

        // Clear challenge
        cookieStore.delete('webauthn_challenge');

        return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 400 });
}
