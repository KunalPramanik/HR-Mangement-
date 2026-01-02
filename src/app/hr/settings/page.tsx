'use client';

import { useRouter } from 'next/navigation';

export default function HRSettingsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">System Config</h1>
            </div>

            <div className="flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Leave Configuration</h3>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-sm text-slate-600 dark:text-slate-300">Annual Leave Quota</span>
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">22 Days</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-600 dark:text-slate-300">Allow Carry Forward</span>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" checked readOnly className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-[#135bec] right-0" />
                            <label className="toggle-label block overflow-hidden h-5 rounded-full bg-[#135bec] cursor-pointer"></label>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">System Maintenance</h3>
                    <button onClick={() => alert('Cache Cleared!')} className="w-full text-left py-2 text-sm text-[#135bec] font-semibold hover:underline">Clear System Cache</button>
                    <button onClick={() => alert('Backup Started!')} className="w-full text-left py-2 text-sm text-[#135bec] font-semibold hover:underline">Run Manual Backup</button>
                </div>
            </div>
        </div>
    );
}
