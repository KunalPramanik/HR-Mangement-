'use client';

import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/analytics');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto pb-20">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Analytics & Reporting</h1>
            <p className="text-slate-500 mb-8">Real-time insights into your organization.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Employees"
                    value={stats?.totalEmployees || 0}
                    icon="group"
                    color="bg-blue-500"
                    trend="+5% vs last month"
                />
                <StatCard
                    title="Present Today"
                    value={stats?.presentToday || 0}
                    icon="person_check"
                    color="bg-green-500"
                    subtitle={`${stats?.attendanceRate || 0}% Attendance Rate`}
                />
                <StatCard
                    title="Open Jobs"
                    value={stats?.activeJobs || 0}
                    icon="work"
                    color="bg-purple-500"
                    trend="3 Critical Roles"
                />
                <StatCard
                    title="Onboarding"
                    value={stats?.pendingOnboarding || 0}
                    icon="person_add"
                    color="bg-orange-500"
                    trend="In Progress"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Chart Placeholder */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Attendance Overview</h3>
                    <div className="h-64 flex items-end justify-between px-4 gap-2">
                        {[65, 78, 85, 90, 82, 88, 92].map((h, i) => (
                            <div key={i} className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-lg relative group">
                                <div
                                    className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded">
                                        {h}%
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Department Distribution Placeholder */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Department Headcount</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Engineering', count: 45, color: 'bg-blue-500' },
                            { name: 'Sales', count: 28, color: 'bg-green-500' },
                            { name: 'Marketing', count: 15, color: 'bg-purple-500' },
                            { name: 'HR', count: 8, color: 'bg-orange-500' },
                            { name: 'Finance', count: 6, color: 'bg-red-500' }
                        ].map((dept, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1 text-slate-700 dark:text-slate-300">
                                    <span>{dept.name}</span>
                                    <span className="font-bold">{dept.count}</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className={`h-full ${dept.color}`} style={{ width: `${(dept.count / 102) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-500">info</span>
                        <p className="text-xs text-slate-500">
                            Headcount data is based on active employee records.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, trend, subtitle }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <span className={`material-symbols-outlined text-6xl ${color.replace('bg-', 'text-')}`}>{icon}</span>
            </div>
            <div className="relative z-10">
                <div className={`size-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-4`}>
                    <span className={`material-symbols-outlined ${color.replace('bg-', 'text-')} text-2xl`}>{icon}</span>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</div>
                {trend && <p className="text-green-500 text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">trending_up</span> {trend}
                </p>}
                {subtitle && <p className="text-slate-400 text-xs">{subtitle}</p>}
            </div>
        </div>
    );
}
