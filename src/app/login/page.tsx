'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        emailOrEmployeeId: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                emailOrEmployeeId: formData.emailOrEmployeeId,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <div className="flex items-center bg-transparent p-4 pb-2 justify-between">
                <div className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                </div>
                <div className="size-12"></div>
            </div>

            {/* Header / Logo Area */}
            <div className="flex flex-col items-center pt-8 pb-4 px-4">
                <div className="bg-[#135bec]/10 p-4 rounded-2xl mb-4">
                    <div
                        className="w-12 h-12 bg-[#135bec] rounded-lg flex items-center justify-center"
                        aria-label="Mindstar Technology Logo"
                    >
                        <span className="material-symbols-outlined text-white text-3xl">token</span>
                    </div>
                </div>
                <h1 className="text-slate-900 dark:text-white tracking-light text-2xl font-bold leading-tight text-center">
                    Mindstar HR Portal
                </h1>
            </div>

            {/* Headline & Body Text */}
            <div className="flex flex-col items-center px-4 pb-6">
                <h2 className="text-slate-900 dark:text-white tracking-light text-[28px] font-bold leading-tight text-center">
                    Welcome Back
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal pt-2 text-center max-w-sm">
                    Log in as Employee, Manager, HR Admin, or Intern to access your workspace.
                </p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex flex-col px-4 w-full max-w-[480px] mx-auto gap-5">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Username Field */}
                <label className="flex flex-col w-full">
                    <p className="text-slate-900 dark:text-white text-sm font-bold leading-normal pb-2">
                        Email or Employee ID
                    </p>
                    <div className="relative w-full">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <span className="material-symbols-outlined text-[20px]">person</span>
                        </div>
                        <input
                            className="flex w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#135bec]/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-14 placeholder:text-slate-400 pl-12 pr-4 text-base font-normal leading-normal transition-all"
                            placeholder="e.g. john.doe@mindstar.com"
                            type="text"
                            value={formData.emailOrEmployeeId}
                            onChange={(e) => setFormData({ ...formData, emailOrEmployeeId: e.target.value })}
                            required
                        />
                    </div>
                </label>

                {/* Password Field */}
                <label className="flex flex-col w-full">
                    <p className="text-slate-900 dark:text-white text-sm font-bold leading-normal pb-2">Password</p>
                    <div className="relative w-full">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <span className="material-symbols-outlined text-[20px]">lock</span>
                        </div>
                        <input
                            className="flex w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#135bec]/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-14 placeholder:text-slate-400 pl-12 pr-12 text-base font-normal leading-normal transition-all"
                            placeholder="Enter your password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#135bec] transition-colors focus:outline-none"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                </label>

                {/* Forgot Password Link */}
                <div className="flex justify-end -mt-1">
                    <a className="text-[#135bec] text-sm font-bold hover:underline" href="/forgot-password">
                        Forgot Password?
                    </a>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-lg bg-[#135bec] h-12 px-5 mt-2 hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-[#135bec]/30 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-white text-base font-bold leading-normal">
                        {loading ? 'Signing in...' : 'Log In'}
                    </span>
                </button>

                {/* Biometric Login */}
                <div className="flex flex-col items-center justify-center mt-4 gap-3">
                    <p className="text-slate-500 text-xs font-medium">Or sign in with</p>
                    <button
                        type="button"
                        onClick={async () => {
                            if (!formData.emailOrEmployeeId) {
                                setError('Please enter your email first to identify your account.');
                                return;
                            }

                            setLoading(true);
                            setError('');

                            try {
                                const { startAuthentication } = await import('@simplewebauthn/browser');

                                // 1. Get options
                                const resp = await fetch('/api/auth/webauthn/authenticate/start', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email: formData.emailOrEmployeeId })
                                });

                                const options = await resp.json();
                                if (options.error) throw new Error(options.error);

                                // 2. Authenticate
                                const authResp = await startAuthentication(options);

                                // 3. Verify
                                const verifyResp = await fetch('/api/auth/webauthn/authenticate/finish', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(authResp)
                                });

                                const verifyJson = await verifyResp.json();

                                if (verifyJson.verified && verifyJson.loginToken) {
                                    // 4. Login with token
                                    const result = await signIn('credentials', {
                                        token: verifyJson.loginToken,
                                        type: 'webauthn',
                                        redirect: false
                                    });

                                    if (result?.error) {
                                        setError('Biometric login failed: ' + result.error);
                                    } else {
                                        router.push('/dashboard');
                                        router.refresh();
                                    }
                                } else {
                                    throw new Error(verifyJson.error || 'Verification failed');
                                }

                            } catch (err: any) {
                                console.error(err);
                                setError(err.message || 'Biometric login failed');
                            } finally {
                                setLoading(false);
                            }
                        }}
                        className="flex items-center justify-center size-12 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-[#135bec] shadow-sm"
                        title="Biometric Login"
                    >
                        <span className="material-symbols-outlined text-[28px]">face</span>
                    </button>
                </div>
            </form>

            {/* Footer */}
            <div className="mt-auto py-8 flex flex-col items-center">
                <a
                    className="text-slate-500 text-sm font-medium hover:text-[#135bec] mb-6 transition-colors"
                    href="mailto:support@mindstar.com"
                >
                    Need help? Contact IT Support
                </a>
                <p className="text-slate-400 text-xs text-center">
                    © 2024 Mindstar Technology. All rights reserved.
                </p>
            </div>
        </div>
    );
}
