'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ExecutiveDashboard() {
    const router = useRouter();
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch('/api/dashboard/executive');
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#135bec]"></div>
            </div>
        );
    }

    if (!data) return null;

    const userRole = session?.user?.role || 'Executive';
    const activeProjects = 12; // Hardcoded mostly as project integration is separate
    const openPositions = 5; // Hardcoded

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{userRole} Dashboard</h1>
                        <p className="text-slate-500">Company-wide performance and insights.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 flex items-center gap-2">
                        <span className="material-symbols-outlined">print</span> Report
                    </button>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Employees</p>
                        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{data.headcount.total}</h3>
                        <p className="text-green-500 text-xs font-bold mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">trending_up</span>
                            +{data.headcount.newThisMonth} New Hires
                        </p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 p-4">
                        <span className="material-symbols-outlined text-8xl text-purple-600">groups</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Live Attendance</p>
                        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{data.attendance.present}</h3>
                        <p className="text-blue-500 text-xs font-bold mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">person_check</span>
                            Present Today
                        </p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 p-4">
                        <span className="material-symbols-outlined text-8xl text-blue-600">co_present</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Pending Requests</p>
                        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{data.requests.leaves + data.requests.resignations}</h3>
                        <div className="flex gap-3 text-xs font-bold mt-2">
                            <span className="text-orange-500">{data.requests.leaves} Leaves</span>
                            <span className="text-red-500">{data.requests.resignations} Resignations</span>
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 p-4">
                        <span className="material-symbols-outlined text-8xl text-orange-600">assignment_late</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Active Projects</p>
                        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{activeProjects}</h3>
                        <p className="text-green-500 text-xs font-bold mt-2 flex items-center gap-1">
                            On Track
                        </p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 p-4">
                        <span className="material-symbols-outlined text-8xl text-green-600">rocket_launch</span>
                    </div>
                </div>
            </div>

            {/* Split View: Department Breakdown & Approvals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Department Distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Department Distribution</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="p-3 rounded-l-lg">Department</th>
                                    <th className="p-3">Headcount</th>
                                    <th className="p-3 rounded-r-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.departments.map((dept: any) => (
                                    <tr key={dept.name} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-3 font-bold text-slate-700 dark:text-slate-200">{dept.name}</td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                    <div className="bg-[#135bec] h-full" style={{ width: `${(dept.count / data.headcount.total) * 100}%` }}></div>
                                                </div>
                                                <span>{dept.count}</span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => router.push(`/directory?search=${encodeURIComponent(dept.name)}`)}
                                                className="text-[#135bec] font-bold text-xs hover:underline"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions / Alerts */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Attention Required</h3>

                    {data.requests.resignations > 0 && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 text-red-600 rounded-full">
                                    <span className="material-symbols-outlined">person_remove</span>
                                </div>
                                <div>
                                    <p className="font-bold text-red-900 dark:text-red-100 text-sm">Resignations</p>
                                    <p className="text-xs text-red-700 dark:text-red-300">{data.requests.resignations} pending review</p>
                                </div>
                            </div>
                            <Link href="/hr/resignations">
                                <button className="text-xs font-bold bg-white text-red-600 px-3 py-1 rounded-full shadow-sm">Review</button>
                            </Link>
                        </div>
                    )}

                    {data.requests.leaves > 0 && (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                                    <span className="material-symbols-outlined">event_busy</span>
                                </div>
                                <div>
                                    <p className="font-bold text-orange-900 dark:text-orange-100 text-sm">Leave Requests</p>
                                    <p className="text-xs text-orange-700 dark:text-orange-300">{data.requests.leaves} pending approval</p>
                                </div>
                            </div>
                            {/* Usually HR/Manager handles leaves, but Execs might view or approve generic ones if needed */}
                            <button onClick={() => router.push('/hr/leaves')} className="text-xs font-bold bg-white text-orange-600 px-3 py-1 rounded-full shadow-sm">View</button>
                        </div>
                    )}

                    <Link href="/messages">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 rounded-xl flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-200 text-slate-600 rounded-full">
                                    <span className="material-symbols-outlined">mail</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Messages</p>
                                    <p className="text-xs text-slate-500">Broadcast updates</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Admin/Executive Specific Tools Grid */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Administration</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <Link href="/hr/employees">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-blue-500 transition-colors flex flex-col items-center text-center gap-2 group">
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-blue-500">people</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Employee Directory</span>
                    </div>
                </Link>
                <Link href="/admin/attendance-summary">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-blue-500 transition-colors flex flex-col items-center text-center gap-2 group">
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-blue-500">monitoring</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Live Attendance</span>
                    </div>
                </Link>
                <Link href="/hr/holidays">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-blue-500 transition-colors flex flex-col items-center text-center gap-2 group">
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-blue-500">calendar_month</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Manage Holidays</span>
                    </div>
                </Link>
                <Link href="/hr/reports">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-blue-500 transition-colors flex flex-col items-center text-center gap-2 group">
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-blue-500">analytics</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Reports</span>
                    </div>
                </Link>
                <Link href="/settings">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-blue-500 transition-colors flex flex-col items-center text-center gap-2 group">
                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-blue-500">settings</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">System Settings</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
