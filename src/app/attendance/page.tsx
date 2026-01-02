'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type AttendanceState = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'LOADING';

export default function AttendancePage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [status, setStatus] = useState<AttendanceState>('LOADING');
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [todayStats, setTodayStats] = useState<{ clockIn?: string; clockOut?: string; duration?: number } | null>(null);
    const [activeBreak, setActiveBreak] = useState<{ activity: 'break' | 'meeting' } | null>(null);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const [now, setNow] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setNow(new Date());
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const updateTimer = () => {
            if (todayStats?.clockIn && status === 'IN_PROGRESS') {
                const start = new Date(todayStats.clockIn).getTime();
                const now = new Date().getTime();
                const diff = now - start;

                if (diff >= 0) {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    setElapsedTime(
                        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                    );
                }
            }
        };

        if (status === 'IN_PROGRESS' && todayStats?.clockIn) {
            updateTimer(); // Initial call
            interval = setInterval(updateTimer, 1000);
        } else {
            setElapsedTime('00:00:00');
        }

        return () => clearInterval(interval);
    }, [status, todayStats?.clockIn]);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/attendance');
            if (res.ok) {
                const data = await res.json();
                setStatus(data.currentState || 'NOT_STARTED');
                setLogs(data.history || []);

                if (data.todayLog) {
                    setTodayStats({
                        clockIn: data.todayLog.clockIn,
                        clockOut: data.todayLog.clockOut,
                        duration: data.todayLog.totalHours
                    });

                    // Check for active break/meeting
                    if (data.todayLog.breaks) {
                        const current = data.todayLog.breaks.find((b: any) => !b.endTime);
                        if (current) {
                            setActiveBreak({ activity: current.activity });
                        } else {
                            setActiveBreak(null);
                        }
                    }
                }
            } else {
                setStatus('NOT_STARTED');
            }
        } catch (e) {
            console.error(e);
            setStatus('NOT_STARTED'); // Fail safe
        }
    };

    const handleAttendance = async (action: 'clock-in' | 'clock-out' | 'start-break' | 'end-break' | 'start-meeting' | 'end-meeting') => {
        setLoading(true);
        setLocationError('');

        // Get Location
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };

            try {
                const res = await fetch('/api/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action, location })
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus(data.currentState);

                    // Optimistic / Immediate Update
                    if (action === 'clock-in') {
                        setLogs(prev => [data.attendance, ...prev]);
                        setTodayStats({
                            clockIn: data.attendance.clockIn,
                            duration: 0
                        });
                    } else if (action === 'clock-out') {
                        setLogs(prev => prev.map(log =>
                            log._id === data.attendance._id ? data.attendance : log
                        ));
                        setTodayStats(prev => prev ? { ...prev, clockOut: data.attendance.clockOut, duration: data.attendance.totalHours } : null);
                        setActiveBreak(null);
                    } else if (action === 'start-break' || action === 'start-meeting') {
                        setActiveBreak({ activity: action === 'start-break' ? 'break' : 'meeting' });
                    } else if (action === 'end-break' || action === 'end-meeting') {
                        setActiveBreak(null);
                    }

                    // Background refresh to be safe
                    fetchStatus();
                } else {
                    setLocationError(data.error || 'Failed to update attendance');
                }
            } catch (error) {
                setLocationError('Network error occurred.');
            } finally {
                setLoading(false);
            }
        }, (error) => {
            setLocationError('Unable to retrieve location. Please allow access.');
            setLoading(false);
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Clock In/Out Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center transaction-all">
                    <div className="mb-6">
                        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white min-h-[40px]">
                            {mounted && now ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="opacity-0">00:00</span>}
                        </h2>
                        <p className="text-slate-500 font-medium mt-1 min-h-[24px]">
                            {mounted && now ? now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : <span className="opacity-0">Loading...</span>}
                        </p>
                    </div>

                    {locationError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {locationError}
                        </div>
                    )}

                    {status === 'LOADING' && (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#135bec]"></div>
                    )}

                    {status === 'NOT_STARTED' && (
                        <button
                            onClick={() => handleAttendance('clock-in')}
                            disabled={loading}
                            className="size-48 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-xl shadow-green-500/30 flex flex-col items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed group"
                        >
                            <span className="material-symbols-outlined text-6xl mb-2 group-hover:animate-pulse">fingerprint</span>
                            <span className="text-xl font-bold">Clock In</span>
                        </button>
                    )}

                    {status === 'IN_PROGRESS' && (
                        <>
                            <div className="flex gap-4 mt-6 w-full justify-center">
                                {activeBreak ? (
                                    <button
                                        onClick={() => handleAttendance(activeBreak.activity === 'break' ? 'end-break' : 'end-meeting')}
                                        disabled={loading}
                                        className="px-6 py-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold flex items-center gap-2 hover:bg-orange-200 transition-colors animate-pulse"
                                    >
                                        <span className="material-symbols-outlined">stop_circle</span>
                                        End {activeBreak.activity === 'break' ? 'Break' : 'Meeting'}
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleAttendance('start-break')}
                                            disabled={loading}
                                            className="flex-1 py-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 font-bold flex flex-col items-center gap-1 hover:bg-yellow-100 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">coffee</span>
                                            Start Break
                                        </button>
                                        <button
                                            onClick={() => handleAttendance('start-meeting')}
                                            disabled={loading}
                                            className="flex-1 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold flex flex-col items-center gap-1 hover:bg-blue-100 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">groups</span>
                                            Start Meeting
                                        </button>
                                    </>
                                )}
                            </div>

                            {!activeBreak && (
                                <button
                                    onClick={() => handleAttendance('clock-out')}
                                    disabled={loading}
                                    className="mt-6 size-40 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-xl shadow-red-500/30 flex flex-col items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed group"
                                >
                                    <span className="material-symbols-outlined text-5xl mb-2 group-hover:animate-pulse">logout</span>
                                    <span className="text-lg font-bold">Clock Out</span>
                                </button>
                            )}

                            <div className="mt-8 flex flex-col items-center animate-fade-in">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 mb-2 ${activeBreak ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${activeBreak ? 'bg-orange-600' : 'bg-green-600'}`}></span>
                                    {activeBreak ? `${activeBreak.activity === 'break' ? 'On Break' : 'In Meeting'}` : 'Currently Working'}
                                </span>
                                <div className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 tracking-wider">
                                    {elapsedTime}
                                </div>
                                {todayStats?.clockIn && (
                                    <p className="text-xs text-slate-400 mt-1">Started at {new Date(todayStats.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                )}
                            </div>
                        </>
                    )}

                    {status === 'COMPLETED' && (
                        <div className="flex flex-col items-center">
                            <div className="size-48 rounded-full bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center text-slate-500 dark:text-slate-300">
                                <span className="material-symbols-outlined text-6xl mb-2">check_circle</span>
                                <span className="text-xl font-bold">Completed</span>
                            </div>
                            <div className="mt-6 text-center space-y-1">
                                <p className="text-slate-900 dark:text-white font-medium">Have a great evening!</p>
                                {todayStats?.duration && (
                                    <p className="text-sm text-slate-500">Total Hours: {todayStats.duration} hrs</p>
                                )}
                            </div>
                        </div>
                    )}


                </div>

                {/* History Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Recent Activity</h3>
                    <div className="flex-1 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-slate-500 text-center py-10">No records found.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {logs.map((log: any) => (
                                    <div key={log._id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${log.status === 'COMPLETED' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-600'}`}>
                                                <span className="material-symbols-outlined">
                                                    {log.status === 'COMPLETED' ? 'event_available' : 'schedule'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                                    {new Date(log.date).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-slate-500 uppercase font-bold">{log.status?.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            {log.clockOut ? (
                                                <p className="text-xs text-slate-500">
                                                    to {new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-blue-500 font-bold animate-pulse">...</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
