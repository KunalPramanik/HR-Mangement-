import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="text-center max-w-md">
                <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-5xl">lock</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    You do not have permission to access this page. Please contact your administrator if you believe this is an error.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link href="/dashboard" className="bg-[#135bec] text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
