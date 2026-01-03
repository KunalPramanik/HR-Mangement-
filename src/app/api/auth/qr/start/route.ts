import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LoginSession from '@/models/LoginSession';
import QRCode from 'qrcode';
import crypto from 'crypto';

export async function POST(req: Request) {
    await dbConnect();

    // Generate specific ID and PIN
    const sessionId = crypto.randomUUID();
    const pin = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit PIN

    // Create session (valid for 5 mins)
    await LoginSession.create({
        sessionId,
        pin,
        status: 'pending',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    // Generate QR URL
    // In dev: http://localhost:3000/mobile-login/[sessionId]
    // In prod: https://domain.com/mobile-login/[sessionId]

    // We need the origin. Since we are in an API route, we can get it from headers.
    const origin = req.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const mobileUrl = `${origin}/mobile-login/${sessionId}`;

    // Generate QR Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(mobileUrl);

    return NextResponse.json({
        sessionId,
        pin,
        qrCode: qrCodeDataUrl,
        mobileUrl
    });
}
