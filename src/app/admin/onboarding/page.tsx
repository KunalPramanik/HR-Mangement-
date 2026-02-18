'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OnboardingDashboard() {
    const router = useRouter();
    const [recentHires, setRecentHires] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch employees with recent joining date or specific status
        fetch('/api/users?view=admin')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Filter for recent joins (last 30 days) or probation
                    const now = new Date();
                    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
                    const filtered = data.filter((u: any) =>
                        (u.dateOfJoining && new Date(u.dateOfJoining) > thirtyDaysAgo) ||
                        u.employmentStatus === 'Probation'
                    );
                    setRecentHires(filtered);
                }
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Onboarding Overview</h1>
                    <p className="text-slate-500">Manage new joiners and onboarding progress.</p>
                </div>
                <Link
                    href="/hr/employees/add"
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
                >
                    <span className="material-symbols-outlined">person_add</span>
                    Onboard New Employee
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-slate-500 font-bold uppercase text-xs mb-2">Pending Docs</h3>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">0</p>
                    <p className="text-xs text-slate-400 mt-1">Employees with missing docs</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-slate-500 font-bold uppercase text-xs mb-2">In Probation</h3>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{recentHires.length}</p>
                    <p className="text-xs text-slate-400 mt-1">Active probation periods</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-slate-500 font-bold uppercase text-xs mb-2">This Month</h3>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{recentHires.length}</p>
                    <p className="text-xs text-slate-400 mt-1">New joiners this month</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                    Recent Joiners
                </div>
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading...</div>
                ) : recentHires.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-slate-400 text-3xl">group_off</span>
                        </div>
                        <p className="text-slate-500 font-medium">No recent joiners found.</p>
                        <Link href="/hr/employees/add" className="text-blue-600 font-bold mt-2 hover:underline">Start Onboarding</Link>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 font-bold">
                            <tr>
                                <th className="px-6 py-3">Employee</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {recentHires.map((emp) => (
                                <tr key={emp._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                {emp.firstName[0]}{emp.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{emp.firstName} {emp.lastName}</p>
                                                <p className="text-xs text-slate-500">{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                        {emp.position}
                                        <span className="block text-xs text-slate-400">{emp.department}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                        {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                            {emp.employmentStatus || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/hr/employees/${emp._id}`} className="text-sm font-bold text-blue-600 hover:underline">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
