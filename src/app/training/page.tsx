'use client';

import { useRouter } from 'next/navigation';

export default function TrainingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Learning & Development</h1>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4">
                    <div className="size-20 rounded-lg bg-blue-100 flex items-center justify-center text-4xl">💻</div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Web Security Basics</h3>
                        <p className="text-xs text-slate-500 mb-2">Mandatory • 45 mins</p>
                        <button onClick={() => alert('Starting Course...')} className="bg-[#135bec] text-white text-xs font-bold px-4 py-2 rounded-lg">Start Course</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4">
                    <div className="size-20 rounded-lg bg-purple-100 flex items-center justify-center text-4xl">👔</div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Leadership 101</h3>
                        <p className="text-xs text-slate-500 mb-2">Optional • 2 hours</p>
                        <button onClick={() => alert('Enrolled!')} className="border border-[#135bec] text-[#135bec] text-xs font-bold px-4 py-2 rounded-lg">Enroll</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 opacity-75">
                    <div className="size-20 rounded-lg bg-green-100 flex items-center justify-center text-4xl">🌱</div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Sustainability at Work</h3>
                        <p className="text-xs text-slate-500 mb-2">Completed • Dec 10</p>
                        <span className="text-green-600 font-bold text-xs flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Certificate</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
