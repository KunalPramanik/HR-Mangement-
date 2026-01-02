'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
                <div className="text-center p-8">
                    <h2 className="text-4xl font-bold mb-4 text-red-500">Critical Error</h2>
                    <p className="mb-8 text-slate-300">A critical system error occurred. Please refresh the page.</p>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    );
}
