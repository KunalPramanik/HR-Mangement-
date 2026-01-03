'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MobileLoginPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const [sessionId, setSessionId] = useState<string>('');
    const [pin, setPin] = useState('');
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        params.then(p => setSessionId(p.sessionId));
    }, [params]);

    const handleAuthenticate = async () => {
        setLoading(true);
        setError('');
        try {
            const { startAuthentication } = await import('@simplewebauthn/browser');

            // 1. Get options
            const resp = await fetch('/api/auth/webauthn/authenticate/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const options = await resp.json();
            if (options.error) throw new Error(options.error);

            // 2. Authenticate
            const authResp = await startAuthentication(options);

            // 3. Verify & Link to QR Session
            const verifyResp = await fetch('/api/auth/webauthn/authenticate/finish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...authResp,
                    qrSessionId: sessionId,
                    qrPin: pin
                })
            });

            const verifyJson = await verifyResp.json();

            if (verifyJson.verified) {
                setSuccess(true);
            } else {
                throw new Error(verifyJson.error || 'Verification failed');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50 p-6 text-center">
                <div>
                    <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
                    </div>
                    <h1 className="text-2xl font-bold text-green-800 mb-2">Authenticated!</h1>
                    <p className="text-green-600">You can now check your desktop screen.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
                <h1 className="text-xl font-bold mb-6 text-center">Mobile Login</h1>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Your Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-slate-50"
                            placeholder="user@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Desktop PIN</label>
                        <input
                            type="text"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-slate-50 text-center tracking-widest text-xl font-bold"
                            placeholder="000 000"
                            maxLength={6}
                        />
                        <p className="text-xs text-slate-400 mt-1 text-center">Enter the 6-digit PIN shown on your desktop.</p>
                    </div>

                    <button
                        onClick={handleAuthenticate}
                        disabled={loading || !email || pin.length < 6}
                        className="w-full bg-[#135bec] text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Authenticate'}
                    </button>
                </div>
            </div>
        </div>
    );
}
