'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function HRDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({ totalEmployees: 0, newEmployees: 0 });

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setStats(data);
                }
            })
            .catch(err => console.error(err));
    }, []);

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
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">HR Dashboard</h1>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div
                    onClick={() => router.push('/directory')}
                    className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-[#135bec] transition-all"
                >
                    <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-3">
                        <span className="material-symbols-outlined">group</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalEmployees}</p>
                    <p className="text-xs text-slate-500">Total Employees</p>
                </div>
                <div
                    onClick={() => router.push('/directory')} // Ideally filter by new, but directory is fine for now
                    className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-purple-500 transition-all"
                >
                    <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-3">
                        <span className="material-symbols-outlined">person_add</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.newEmployees}</p>
                    <p className="text-xs text-slate-500">New (This Month)</p>
                </div>
            </div>

            {/* Management Modules */}
            <div className="grid grid-cols-1 gap-3">
                <button onClick={() => router.push('/hr/employees/add')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:border-[#135bec] transition-all">
                    <div className="size-12 rounded-full bg-[#135bec]/10 text-[#135bec] flex items-center justify-center">
                        <span className="material-symbols-outlined">person_add</span>
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Add Employee</h3>
                        <p className="text-xs text-slate-500">Onboard new staff & docs</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </button>

                <button onClick={() => router.push('/directory')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:border-[#135bec] transition-all">
                    <div className="size-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">badge</span>
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Employee Directory</h3>
                        <p className="text-xs text-slate-500">View & manage profiles</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </button>

                <button onClick={() => router.push('/hr/reports')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:border-[#135bec] transition-all">
                    <div className="size-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Reports</h3>
                        <p className="text-xs text-slate-500">Payroll, Attendance, etc.</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </button>

                <button onClick={() => router.push('/hr/announcements/create')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:border-[#135bec] transition-all">
                    <div className="size-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">campaign</span>
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Announcements</h3>
                        <p className="text-xs text-slate-500">Post news & updates</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </button>

                <button onClick={() => router.push('/hr/settings')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:border-[#135bec] transition-all">
                    <div className="size-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">settings</span>
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">System Config</h3>
                        <p className="text-xs text-slate-500">Global HR settings</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </button>

                <button onClick={() => router.push('/hr/leaves')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:border-[#135bec] transition-all">
                    <div className="size-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">event_available</span>
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Leave Approvals</h3>
                        <p className="text-xs text-slate-500">Review requests</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </button>

                <button onClick={() => router.push('/hr/tickets')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:border-[#135bec] transition-all">
                    <div className="size-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">support_agent</span>
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Support Tickets</h3>
                        <p className="text-xs text-slate-500">Manage issues</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </button>

                <button onClick={() => router.push('/hr/performance')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:border-[#135bec] transition-all">
                    <div className="size-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">reviews</span>
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Performance Reviews</h3>
                        <p className="text-xs text-slate-500">Evaluations & Ratings</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </button>

                <button onClick={() => router.push('/hr/assets')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:border-[#135bec] transition-all">
                    <div className="size-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">devices</span>
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Assets & Inventory</h3>
                        <p className="text-xs text-slate-500">Track equipment</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </button>

                <button onClick={() => router.push('/hr/recruitment')} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:border-[#135bec] transition-all">
                    <div className="size-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">groups_2</span>
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Recruitment</h3>
                        <p className="text-xs text-slate-500">Jobs & Referrals</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </button>
            </div>

            <div className="mt-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Pending Tasks</h3>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3 border-b border-slate-50 dark:border-slate-700 pb-3 last:border-0 last:pb-0">
                        <div className="size-2 rounded-full bg-red-500"></div>
                        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">Approve User Onboarding (John D.)</span>
                        <button onClick={() => router.push('/directory')} className="text-xs font-bold text-[#135bec]">View</button>
                    </div>
                    <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-700 pb-3 last:border-0 last:pb-0">
                        <div className="size-2 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">Review WFH Policy Update</span>
                        <button onClick={() => router.push('/policies')} className="text-xs font-bold text-[#135bec]">View</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
