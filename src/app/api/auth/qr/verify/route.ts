import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LoginSession from '@/models/LoginSession';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req: Request) {
    const { sessionId, pin, email } = await req.json();

    await dbConnect();
    const sessionDoc = await LoginSession.findOne({ sessionId });

    if (!sessionDoc) {
        return NextResponse.json({ error: 'Session expired or invalid' }, { status: 400 });
    }

    if (sessionDoc.pin !== pin) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
    }

    if (sessionDoc.status === 'authenticated') {
        return NextResponse.json({ success: true });
    }

    // Identify User
    // NOTE: This endpoint assumes the MOBILE CLIENT has ALREADY authenticated the user
    // (e.g. via Biometrics locally on the mobile page).
    // In a real flow, we would pass the biometric proof here.
    // For this implementation, we will trust the mobile client's assertion 
    // (verified via the biometric APIs on the mobile page).

    // However, to be secure, 'mobile-login' page should perform the WebAuthn finish call, 
    // and THAT call should return a "proof" token we pass here?
    // OR, we can just do the WebAuthn verification IN the mobile page's API calls, 
    // and once success, update the session.

    // Let's assume the mobile page calls `/api/auth/webauthn/authenticate/finish`.
    // We should modify THAT endpoint to optionally accept a `sessionId` to update!

    // BUT, the user user wants "pin" verification.

    // New Strategy for Mobile Page:
    // 1. User enters Email (if needed) -> verifies User exists.
    // 2. User enters PIN -> verifies Session PIN matches.
    // 3. User performs Biometric Auth.
    // 4. Server verifies Biometric Auth AND updates the LoginSession with the User.

    // So we don't need a separate `/api/auth/qr/verify` IF we update the WebAuthn finish endpoint.
    // OR we can keep this for "pre-check" of PIN.

    // Let's use this for "Link User to Session" after successful auth.
    // Wait, that's unsafe. Anyone could call it.

    // SECURE FLOW:
    // Mobile calls `/api/auth/webauthn/authenticate/finish`.
    // Body includes: { ...webAuthnResponse, qrSessionId: '...', qrPin: '...' }
    // If qrSessionId is present:
    //   1. Check PIN.
    //   2. Verify WebAuthn.
    //   3. If valid, update LoginSession status = 'authenticated', userId = ..., loginToken = new token.

    // So I need to UPDATE `src/app/api/auth/webauthn/authenticate/finish/route.ts` instead.

    return NextResponse.json({ error: 'Use WebAuthn endpoint' }, { status: 400 });
}
