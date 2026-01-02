'use client';

import { useRouter } from 'next/navigation';

export default function GoalsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Goals</h1>
                </div>
                <button onClick={() => alert('Add New Goal')} className="size-10 rounded-full bg-[#135bec] text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="material-symbols-outlined">add</span>
                </button>
            </div>

            <div className="flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-md">In Progress</span>
                        <span className="text-xs text-slate-400">Due Dec 31</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Complete React Advanced Certification</h3>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">60% Completed</span>
                        <button onClick={() => alert('Update Progress')} className="text-[#135bec] text-xs font-bold">Update</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">Completed</span>
                        <span className="text-xs text-slate-400">Due Nov 30</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Deliver Project Alpha</h3>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">100% Achieved</span>
                        <span className="text-green-600 font-bold text-xs flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Done</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
