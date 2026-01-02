'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface UserStatus {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    department: string;
    position: string;
    profilePicture?: string;
    status: 'present' | 'absent' | 'late' | 'half-day' | 'not-checked-in' | 'active';
    clockIn?: string;
    breakDuration?: number;
    meetingDuration?: number;
}

interface Stats {
    total: number;
    present: number;
    absent: number; // Applied leave or marked absent
    notCheckedIn: number;
}

export default function AttendanceSummaryPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [stats, setStats] = useState<Stats>({ total: 0, present: 0, absent: 0, notCheckedIn: 0 });
    const [users, setUsers] = useState<UserStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const res = await fetch('/api/attendance/summary');
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setUsers(data.users);
            } else {
                // If unauthorized, redirect
                if (res.status === 401 || res.status === 403) {
                    router.push('/dashboard');
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-700 border-green-200';
            case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'absent': return 'bg-red-100 text-red-700 border-red-200';
            case 'half-day': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#135bec]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                        {session?.user?.role === 'manager' ? 'Team Attendance' : 'Live Attendance Overview'}
                    </h1>
                    <p className="text-xs text-slate-500">Real-time status for today ({new Date().toLocaleDateString()})</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Team</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</h3>
                </div>
                {/* Active Now Card */}
                <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <p className="text-xs font-bold text-blue-600 uppercase">Active Now</p>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{(stats as any).activeNow || 0}</h3>
                </div>
                <div className="bg-green-50 dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-green-100 dark:border-green-900/30">
                    <p className="text-xs font-bold text-green-600 uppercase">Total Present</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.present}</h3>
                </div>
                <div className="bg-yellow-50 dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-yellow-100 dark:border-yellow-900/30">
                    <p className="text-xs font-bold text-yellow-600 uppercase">Not Checked In</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.notCheckedIn}</h3>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-3">
                {users.map((user) => (
                    <div key={user._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-full flex items-center justify-center text-white font-bold relative ${user.status === 'active' ? 'bg-blue-500' :
                                user.status === 'present' ? 'bg-green-500' :
                                    user.status === 'not-checked-in' ? 'bg-slate-300' : 'bg-red-400'
                                }`}>
                                {user.status === 'active' && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
                                    </span>
                                )}
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    user.firstName[0]
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{user.firstName} {user.lastName}</h4>
                                <p className="text-xs text-slate-500 font-medium capitalize">{user.position} • {user.department}</p>
                            </div>
                        </div>

                        {/* Middle Stats Section for Breaks/Meetings */}
                        {(user.breakDuration || user.meetingDuration) ? (
                            <div className="flex items-center gap-4 text-xs">
                                {Number(user.breakDuration) > 0 && (
                                    <div className="flex items-center gap-1 text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">
                                        <span className="material-symbols-outlined text-[16px]">coffee</span>
                                        <span className="font-semibold">{user.breakDuration}m Break</span>
                                    </div>
                                )}
                                {Number(user.meetingDuration) > 0 && (
                                    <div className="flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                                        <span className="material-symbols-outlined text-[16px]">groups</span>
                                        <span className="font-semibold">{user.meetingDuration}m Meeting</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Spacer if no stats, to keep alignment nice on desktop
                            <div className="hidden md:block"></div>
                        )}


                        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">

                            <div className="text-right">
                                {user.status === 'active' ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase border bg-blue-100 text-blue-700 border-blue-200">
                                        Working Now
                                    </span>
                                ) : (
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${getStatusColor(user.status)}`}>
                                        {user.status.replace(/-/g, ' ')}
                                    </span>
                                )}

                                <div className="mt-1">
                                    {user.clockIn ? (
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            In: {new Date(user.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-slate-300 font-mono">--:--</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
