'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                <h1 className="relative text-9xl font-black text-slate-200 dark:text-slate-800 select-none">
                    404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-blue-600 dark:text-blue-500 animate-bounce">
                        not_listed_location
                    </span>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                Page Not Found
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
                Oops! The page you are looking for doesn't exist or has been moved.
                It might have gone on a holiday! 🏖️
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    Go Back
                </button>
                <Link
                    href="/dashboard"
                    className="px-6 py-3 rounded-xl bg-[#135bec] text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
