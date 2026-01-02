'use client';

import { useRouter } from 'next/navigation';

export default function ManagerDashboard() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Manager Dashboard</h1>
                </div>
            </div>

            {/* Approvals Widget */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-500">pending_actions</span>
                        Pending Approvals
                    </h2>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">3</span>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold">JD</div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">John Doe</p>
                                <p className="text-xs text-slate-500">Leave Request • 2 days</p>
                            </div>
                        </div>
                        <button onClick={() => router.push('/manager/approvals')} className="text-[#135bec] text-xs font-bold">Review</button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold">AS</div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Alice Smith</p>
                                <p className="text-xs text-slate-500">Timesheet Adjustment</p>
                            </div>
                        </div>
                        <button onClick={() => router.push('/manager/approvals')} className="text-[#135bec] text-xs font-bold">Review</button>
                    </div>
                </div>
                <button onClick={() => router.push('/manager/approvals')} className="w-full mt-3 py-2 text-sm text-slate-500 font-medium hover:text-[#135bec]">View All Request</button>
            </div>

            {/* Team Management */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <button onClick={() => router.push('/team/calendar')} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-[#135bec] transition-all">
                    <span className="material-symbols-outlined text-3xl text-blue-500">calendar_month</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Team Calendar</span>
                </button>
                <button onClick={() => router.push('/manager/projects')} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-[#135bec] transition-all">
                    <span className="material-symbols-outlined text-3xl text-purple-500">rocket_launch</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Team Projects</span>
                </button>
            </div>

            <button onClick={() => router.push('/goals')} className="w-full bg-gradient-to-r from-[#135bec] to-blue-600 p-4 rounded-xl shadow-lg shadow-blue-500/20 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined">track_changes</span>
                    <div className="text-left">
                        <p className="font-bold">Goal Tracking</p>
                        <p className="text-xs text-blue-100">Review Q4 Performance</p>
                    </div>
                </div>
                <span className="material-symbols-outlined">chevron_right</span>
            </button>
        </div>
    );
}
