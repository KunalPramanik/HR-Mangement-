'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import KudosWall from '@/components/dashboard/KudosWall';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    // Mock Notification Check (or fetch if API exists)
    useEffect(() => {
        const checkNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data: any[] = await res.json();
                    const unread = data.filter(n => !n.read).length;
                    setUnreadCount(unread);
                }
            } catch (e) { console.error(e); }
        };
        checkNotifications();
    }, []);

    // ... (rest of auth checks)

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#135bec]"></div>
            </div>
        );
    }

    if (!session) {
        return null; // Handled by router.push
    }

    const user = session.user;
    const firstName = user.name?.split(' ')[0] || 'User';
    const isAdmin = ['admin', 'cxo', 'cho'].includes(user.role);

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-24 md:pb-8 xl:max-w-7xl xl:mx-auto">
            {/* Top App Bar */}
            <div className="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-white dark:ring-slate-700 shadow-sm bg-gradient-to-br from-[#135bec] to-blue-600 flex items-center justify-center text-white font-bold"
                    >
                        {firstName[0]}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-slate-900 dark:text-white text-base font-bold leading-tight tracking-[-0.015em]">
                            Mindstar Tech
                        </h2>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Employee Portal
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                    {isAdmin && (
                        <Link href="/settings">
                            <button className="flex items-center justify-center rounded-full size-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Settings">
                                <span className="material-symbols-outlined text-[24px]">settings</span>
                            </button>
                        </Link>
                    )}
                    <Link href="/help">
                        <button className="flex items-center justify-center rounded-full size-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Help & Support">
                            <span className="material-symbols-outlined text-[24px]">help</span>
                        </button>
                    </Link>
                    <Link href="/notifications">
                        <button className="relative flex items-center justify-center rounded-full size-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-[24px]">notifications</span>
                            {/* Blinking Light */}
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                            )}
                        </button>
                    </Link>
                </div>
            </div>

            {/* Greeting Section */}
            <div className="px-4 pt-6 pb-2">
                <h2 className="text-slate-900 dark:text-white tracking-tight text-[28px] font-extrabold leading-tight">
                    {(() => {
                        const hour = new Date().getHours();
                        if (hour < 12) return 'Good Morning';
                        if (hour < 18) return 'Good Afternoon';
                        return 'Good Evening';
                    })()}, {firstName}.
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal pt-1 capitalize">
                    {user.position} • {user.role}
                </p>
            </div>

            {/* Employee Recognition - Kudos Wall */}
            <div className="px-4 py-2">
                <KudosWall />
            </div>

            {/* Role Specific Dashboard Link */}
            {(user.role === 'hr' || user.role === 'manager' || user.role === 'admin' || user.role === 'director' || user.role === 'cho' || user.role === 'cxo') && (
                <div className="px-4 py-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Link href={user.role === 'hr' ? "/hr/dashboard" : (user.role === 'manager' ? "/manager/dashboard" : "/director/dashboard")}>
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 flex items-center justify-between text-white shadow-lg cursor-pointer transform transition-transform active:scale-95 h-full">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-yellow-400">admin_panel_settings</span>
                                <div>
                                    <h3 className="font-bold text-sm">
                                        {user.role === 'hr' ? 'HR Dashboard' :
                                            user.role === 'manager' ? 'Manager Dashboard' :
                                                'Executive Overview'}
                                    </h3>
                                    <p className="text-xs text-slate-300">Manage operations & approvals</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                    </Link>

                    {/* Attendance Summary Link for all high levels */}
                    {/* Attendance Summary Link for all high levels */}
                    <Link href="/admin/attendance-summary">
                        <div className="bg-gradient-to-r from-[#135bec] to-blue-600 rounded-xl p-4 flex items-center justify-between text-white shadow-lg cursor-pointer transform transition-transform active:scale-95 h-full">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-white">monitoring</span>
                                <div>
                                    <h3 className="font-bold text-sm">Live Attendance</h3>
                                    <p className="text-xs text-blue-100">View today's check-ins</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined">visibility</span>
                        </div>
                    </Link>

                    {/* Admin: Adjust Leaves */}
                    {user.role === 'admin' && (
                        <Link href="/admin/leaves/adjustment">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 flex items-center justify-between text-white shadow-lg cursor-pointer transform transition-transform active:scale-95 h-full">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-white">tune</span>
                                    <div>
                                        <h3 className="font-bold text-sm">Adjust Balances</h3>
                                        <p className="text-xs text-orange-100">Modify employee leaves</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </div>
                        </Link>
                    )}

                    {/* Approvers: Pending Requests */}
                    {['cxo', 'cho', 'director'].includes(user.role) && (
                        <Link href="/approvals/leaves">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 flex items-center justify-between text-white shadow-lg cursor-pointer transform transition-transform active:scale-95 h-full">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-white">approval_delegation</span>
                                    <div>
                                        <h3 className="font-bold text-sm">Leave Approvals</h3>
                                        <p className="text-xs text-purple-100">Review adjustments</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </div>
                        </Link>
                    )}
                </div>
            )}

            {/* My Status Card (Leave Balance) */}
            <div className="px-4 py-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">
                                Annual Leave
                            </p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                14 Days <span className="text-lg font-medium text-slate-400 dark:text-slate-500">Available</span>
                            </h3>
                        </div>
                        <Link href="/team/calendar">
                            <div className="p-2 bg-[#135bec]/10 rounded-lg hover:bg-[#135bec]/20 transition-colors cursor-pointer" title="View Leave Calendar">
                                <span className="material-symbols-outlined text-[#135bec] text-[24px]">calendar_month</span>
                            </div>
                        </Link>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-2 overflow-hidden">
                        <div className="bg-[#135bec] h-2.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-400 dark:text-slate-500">
                        <span>Used: 8 days</span>
                        <span>Total: 22 days</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="flex flex-col">
                <div className="flex items-center justify-between px-4 pt-2 pb-3">
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        Quick Actions
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4">
                    {/* Action 1 - Request Leave */}
                    <Link href="/leave/request">
                        <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm aspect-[4/3] cursor-pointer hover:shadow-md transition-all">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#135bec]/80 to-[#135bec]/40 transition-transform duration-500 group-hover:scale-105"></div>
                            <div className="absolute inset-0 flex flex-col justify-end p-4">
                                <span className="material-symbols-outlined text-white mb-1 text-[28px]">flight_takeoff</span>
                                <p className="text-white text-base font-bold leading-tight">Request Leave</p>
                            </div>
                        </div>
                    </Link>

                    {/* Action 2 - View Payslips */}
                    <Link href="/payslips">
                        <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm aspect-[4/3] cursor-pointer hover:shadow-md transition-all">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-600/40 transition-transform duration-500 group-hover:scale-105"></div>
                            <div className="absolute inset-0 flex flex-col justify-end p-4">
                                <span className="material-symbols-outlined text-white mb-1 text-[28px]">payments</span>
                                <p className="text-white text-base font-bold leading-tight">View Payslips</p>
                            </div>
                        </div>
                    </Link>

                    {/* Action 3 - Team Calendar */}
                    <Link href="/team/calendar">
                        <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm aspect-[4/3] cursor-pointer hover:shadow-md transition-all">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-600/80 to-green-400/40 transition-transform duration-500 group-hover:scale-105"></div>
                            <div className="absolute inset-0 flex flex-col justify-end p-4">
                                <span className="material-symbols-outlined text-white mb-1 text-[28px]">groups</span>
                                <p className="text-white text-base font-bold leading-tight">Team Calendar</p>
                            </div>
                        </div>
                    </Link>

                    {/* Action 4 - Attendance */}
                    <Link href="/attendance">
                        <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm aspect-[4/3] cursor-pointer hover:shadow-md transition-all">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-purple-400/40 transition-transform duration-500 group-hover:scale-105"></div>
                            <div className="absolute inset-0 flex flex-col justify-end p-4">
                                <span className="material-symbols-outlined text-white mb-1 text-[28px]">schedule</span>
                                <p className="text-white text-base font-bold leading-tight">Attendance</p>
                            </div>
                        </div>
                    </Link>

                    {/* Action 5 - Directory */}
                    <Link href="/directory">
                        <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm aspect-[4/3] cursor-pointer hover:shadow-md transition-all">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-600/80 to-teal-400/40 transition-transform duration-500 group-hover:scale-105"></div>
                            <div className="absolute inset-0 flex flex-col justify-end p-4">
                                <span className="material-symbols-outlined text-white mb-1 text-[28px]">recent_actors</span>
                                <p className="text-white text-base font-bold leading-tight">Directory</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Latest Announcement */}
            <div className="flex flex-col mt-6">
                <div className="flex items-center justify-between px-4 pb-3">
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        Recent News
                    </h2>
                    <Link href="/announcements" className="text-[#135bec] text-sm font-bold">
                        View all
                    </Link>
                </div>
                <div className="px-4">
                    <div className="flex flex-col gap-4">
                        {/* Announcement Card */}
                        <Link href="/announcements">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 items-start cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="shrink-0 size-12 rounded-lg bg-[#135bec]/10 flex items-center justify-center text-[#135bec]">
                                    <span className="material-symbols-outlined">campaign</span>
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-xs font-semibold text-[#135bec] mb-1">Today, 2:00 PM</span>
                                    <h3 className="text-slate-900 dark:text-white font-bold text-base leading-snug mb-1">
                                        Q4 Town Hall Meeting
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
                                        Join us for company updates, quarterly awards, and a Q&A session with the leadership team.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Payslip Row */}
                        <Link href="/payslips">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                        <span className="material-symbols-outlined text-[20px]">attach_money</span>
                                    </div>
                                    <div>
                                        <p className="text-slate-900 dark:text-white font-bold text-sm">Payslip Ready</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs">December 2024</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="h-6"></div>

            {/* Bottom Navigation removed - handled by AppShell */}
        </div>
    );
}
