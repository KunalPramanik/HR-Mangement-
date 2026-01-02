'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSubmitted(true);
        setLoading(false);
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
            {/* Top Bar with Back Button */}
            <div className="flex items-center bg-transparent p-4 pb-2 justify-between">
                <Link href="/login">
                    <div className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                    </div>
                </Link>
                <div className="size-12"></div>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 px-4 pb-12 sm:pb-24">
                <div className="w-full max-w-[480px]">
                    {!submitted ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-[#135bec]/10 text-[#135bec] mb-6">
                                    <span className="material-symbols-outlined text-4xl">lock_reset</span>
                                </div>
                                <h1 className="text-slate-900 dark:text-white text-3xl font-bold mb-3">
                                    Forgot Password?
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-base">
                                    No worries! Enter your email or employee ID and we'll send you reset instructions.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <label className="flex flex-col w-full">
                                    <span className="text-slate-900 dark:text-white text-sm font-bold pb-2">
                                        Email or Employee ID
                                    </span>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            <span className="material-symbols-outlined text-[20px]">badge</span>
                                        </div>
                                        <input
                                            className="w-full rounded-lg h-14 pl-12 pr-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#135bec]/50 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                                            placeholder="Enter your registered email or ID"
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            required
                                        />
                                    </div>
                                </label>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-[#135bec] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                                >
                                    {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center animate-fadeIn">
                            <div className="inline-flex items-center justify-center size-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 mb-6">
                                <span className="material-symbols-outlined text-5xl">mark_email_read</span>
                            </div>
                            <h2 className="text-slate-900 dark:text-white text-3xl font-bold mb-3">
                                Check your email
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-base mb-8">
                                We've sent password reset instructions to <br />
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{identifier}</span>
                            </p>

                            <button
                                onClick={() => router.push('/login')}
                                className="w-full h-12 bg-[#135bec] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                            >
                                Back to Login
                            </button>

                            <p className="mt-8 text-sm text-slate-500">
                                Didn't receive the email? <button onClick={() => setSubmitted(false)} className="text-[#135bec] font-bold hover:underline">Click to resend</button>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Help */}
            {!submitted && (
                <div className="p-6 text-center">
                    <p className="text-slate-500 text-sm">
                        Remember your password? <Link href="/login" className="text-[#135bec] font-bold hover:underline">Log in</Link>
                    </p>
                </div>
            )}
        </div>
    );
}
