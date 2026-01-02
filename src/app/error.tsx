'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6 relative">
                <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
                <span className="material-symbols-outlined text-6xl text-red-500 relative">
                    cloud_off
                </span>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Something went wrong!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
                We encountered an unexpected error. This might be due to a connection issue or a temporary glitch.
            </p>

            {/* Optional: Show error message in dev mode */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mb-8 p-4 bg-red-100 text-red-800 rounded-lg text-sm font-mono max-w-2xl overflow-auto text-left">
                    {error.message}
                </div>
            )}

            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-all shadow-lg"
                >
                    Try Again
                </button>
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    Go Dashboard
                </button>
            </div>
        </div>
    );
}
