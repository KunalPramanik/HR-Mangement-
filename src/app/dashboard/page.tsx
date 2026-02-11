'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AiAssistant from '../../components/AiAssistant';

export default function DashboardPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isOnDuty, setIsOnDuty] = useState(false);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [time, setTime] = useState(new Date());
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [showToast, setShowToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Toast Timer
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const toggleShift = () => {
        const newStatus = !isOnDuty;
        setIsOnDuty(newStatus);
        if (!newStatus) setIsOnBreak(false); // Reset break if going off duty
        setShowToast({
            msg: newStatus ? 'You are now ON DUTY.' : 'You are now OFF DUTY.',
            type: 'success'
        });
    };

    const toggleBreak = () => {
        if (!isOnDuty) {
            setShowToast({ msg: 'You must be ON DUTY to take a break.', type: 'error' });
            return;
        }
        const newStatus = !isOnBreak;
        setIsOnBreak(newStatus);
        setShowToast({
            msg: newStatus ? 'Break started. Enjoy!' : 'Break ended. Welcome back!',
            type: 'success'
        });
    };

    const endShift = () => {
        if (!isOnDuty) {
            setShowToast({ msg: 'You are already OFF DUTY.', type: 'error' });
            return;
        }
        setIsOnDuty(false);
        setIsOnBreak(false);
        setShowToast({ msg: 'Shift ended successfully. Have a great evening!', type: 'success' });
    };

    const toggleActionMenu = (id: number) => {
        setOpenActionMenuId(openActionMenuId === id ? null : id);
    };

    const [locationStatus, setLocationStatus] = useState<'verifying' | 'verified' | 'error'>('verifying');
    const [showAi, setShowAi] = useState(false);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => setLocationStatus('verified'),
                (error) => setLocationStatus('error')
            );
        } else {
            setLocationStatus('error');
        }
    }, []);

    return (
        <div className="flex flex-col gap-6 md:gap-8 pb-20 md:pb-12 w-full max-w-[1600px] mx-auto min-h-screen relative">

            {/* AI Assistant Toggle */}
            <button
                onClick={() => setShowAi(!showAi)}
                className="fixed bottom-24 right-6 md:bottom-32 md:right-8 z-50 size-14 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform animate-bounce-slow"
            >
                <span className="material-symbols-outlined text-[28px]">{showAi ? 'close' : 'auto_awesome'}</span>
            </button>

            {showAi && (
                <div className="fixed bottom-40 right-6 md:right-8 z-50 w-full max-w-sm md:max-w-md animate-scaleUp origin-bottom-right">
                    <AiAssistant />
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-lg font-bold text-white animate-scaleUp ${showToast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {showToast.msg}
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight mb-2">System Terminal</h1>
                    <p className="text-[#6b7280] font-medium text-sm md:text-base">Welcome back, Administrator. Your organization's health is optimal.</p>
                </div>
                <div className="flex bg-white p-1 rounded-full shadow-sm border border-gray-100 self-start md:self-auto">
                    <button onClick={() => router.push('/dashboard')} className="px-5 py-2 rounded-full bg-[#111827] text-white font-bold text-xs md:text-sm shadow-md transition-all">Dashboard</button>
                    <button onClick={() => router.push('/management')} className="px-5 py-2 rounded-full text-gray-500 font-bold text-xs md:text-sm hover:bg-gray-50 transition-all">Management</button>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Card 1: Attendance */}
                <div className="soft-card p-6 md:p-8 flex items-center justify-between relative overflow-hidden group min-h-[160px]">
                    <div className="relative size-20 md:size-24 shrink-0">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" strokeDasharray="92, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-lg md:text-xl font-bold text-[#111827]">92%</div>
                    </div>
                    <div className="text-right z-10 pl-4">
                        <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">Attendance</p>
                        <h3 className="text-xl md:text-2xl font-extrabold text-[#111827] mb-1">Excellent</h3>
                        <p className="text-xs md:text-sm font-bold text-[#10b981]">↗ +4.2%</p>
                    </div>
                </div>

                {/* Card 2: Open Tasks */}
                <div className="soft-card p-6 md:p-8 flex items-center justify-between relative overflow-hidden group min-h-[160px]">
                    <div className="relative size-20 md:size-24 shrink-0">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-[#8b5cf6] drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" strokeDasharray="14, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-lg md:text-xl font-bold text-[#111827]">14</div>
                    </div>
                    <div className="text-right z-10 pl-4">
                        <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">Open Tasks</p>
                        <h3 className="text-xl md:text-2xl font-extrabold text-[#111827] mb-1">On Track</h3>
                        <p className="text-xs md:text-sm font-bold text-[#3b82f6]">🕒 3 due today</p>
                    </div>
                </div>

                {/* Card 3: Sentiment */}
                <div className="soft-card p-6 md:p-8 flex items-center justify-between relative overflow-hidden group min-h-[160px]">
                    <div className="relative size-20 md:size-24 shrink-0">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-[#ef4444] drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" strokeDasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-lg md:text-xl font-bold text-[#111827]">4.8</div>
                    </div>
                    <div className="text-right z-10 pl-4">
                        <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">Sentiment</p>
                        <h3 className="text-xl md:text-2xl font-extrabold text-[#111827] mb-1">High Peak</h3>
                        <p className="text-xs md:text-sm font-bold text-[#ef4444]">❤ Top 5% Org</p>
                    </div>
                </div>
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Workstation Status */}
                <div className="soft-card p-6 md:p-8 flex flex-col justify-between h-[350px] md:h-[400px]">
                    <div>
                        <p className="text-xs font-bold text-gray-400 tracking-wider uppercase text-center mb-2 md:mb-4">Workstation Status</p>

                        {/* Location Badge */}
                        <div className="flex justify-center mb-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wider transition-colors
                                ${locationStatus === 'verified' ? 'bg-green-50 text-green-600 border-green-200' :
                                    locationStatus === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200'}
                            `}>
                                <span className={`size-1.5 rounded-full ${locationStatus === 'verified' ? 'bg-green-500' : locationStatus === 'error' ? 'bg-red-500' : 'bg-gray-400 animate-pulse'}`}></span>
                                {locationStatus === 'verified' ? 'Location Verified' : locationStatus === 'error' ? 'Location Error' : 'Verifying...'}
                            </span>
                        </div>

                        <div className="bg-gray-100 rounded-full p-2 flex items-center justify-between relative w-full max-w-[280px] mx-auto mb-8 md:mb-10 h-14 md:h-16">
                            <span className={`flex-1 text-center text-xs md:text-sm font-bold z-10 transition-colors ${!isOnDuty ? 'text-gray-900' : 'text-gray-400'}`}>OFF DUTY</span>
                            <span className={`flex-1 text-center text-xs md:text-sm font-bold z-10 transition-colors ${isOnDuty ? 'text-[#10b981]' : 'text-gray-400'}`}>ON DUTY</span>

                            {/* Toggle Pill */}
                            <div
                                onClick={toggleShift}
                                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-center
                                ${isOnDuty ? 'left-[calc(50%+2px)] bg-white' : 'left-1 bg-white'}`}
                            >
                                <div className={`size-6 md:size-8 rounded-full transition-colors ${isOnDuty ? 'bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-gray-300'}`}></div>
                            </div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-4xl md:text-5xl font-mono font-bold text-[#111827] mb-2 tracking-tighter">
                                {time.toLocaleTimeString([], { hour12: false })}
                            </h2>
                            <p className={`font-medium text-sm transition-colors ${isOnBreak ? 'text-yellow-500 font-bold' : 'text-gray-400'}`}>
                                {isOnBreak ? 'ON BREAK - Returns at 1:00 PM' : (isOnDuty ? 'Shift started at 08:00 AM' : 'Shift not started')}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={toggleBreak}
                            disabled={!isOnDuty}
                            className={`flex-1 py-3 border shadow-sm rounded-xl font-bold text-xs md:text-sm active:scale-95 transition-all
                            ${isOnBreak ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-gray-100 text-[#111827] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                        >
                            {isOnBreak ? 'END BREAK' : 'TAKE BREAK'}
                        </button>
                        <button
                            onClick={endShift}
                            disabled={!isOnDuty}
                            className="flex-1 py-3 bg-white border border-gray-100 shadow-sm rounded-xl font-bold text-[#ef4444] text-xs md:text-sm hover:bg-red-50 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            END SHIFT
                        </button>
                    </div>
                </div>

                {/* Performance Metrics Chart */}
                <div className="soft-card p-6 md:p-8 col-span-1 lg:col-span-2 h-[350px] md:h-[400px] flex flex-col">
                    <div className="flex justify-between items-start mb-4 md:mb-8">
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-[#111827]">Performance Metrics</h3>
                            <p className="text-gray-500 text-xs md:text-sm">Global efficiency across all departments</p>
                        </div>
                        <button className="size-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 px-0 md:px-4 pb-0 md:pb-4">
                        {[40, 65, 50, 80, 75, 25, 15].map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                                <div className="w-full bg-[#3b82f6]/10 rounded-t-lg md:rounded-t-2xl relative h-[80%] flex items-end group-hover:bg-[#3b82f6]/20 transition-colors overflow-hidden">
                                    <div
                                        style={{ height: `${height}%` }}
                                        className={`w-full rounded-t-md md:rounded-t-xl transition-all duration-500 ${height > 50 ? 'bg-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-[#93c5fd]'}`}
                                    ></div>
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Milestones */}
                <div className="soft-card p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-[#111827]">Recent Milestones</h3>
                        <Link href="/milestones" className="text-xs font-bold text-[#3b82f6] hover:underline">VIEW ALL</Link>
                    </div>

                    <div className="space-y-6">
                        {[
                            { name: 'Sarah Jenkins', event: '5-Year Work Anniversary today!', icon: 'celebration', color: 'bg-blue-100 text-blue-600' },
                            { name: 'New Employee Onboarding', event: 'Marco Rossi joined Creative Team.', icon: 'person_add', color: 'bg-green-100 text-green-600' },
                            { name: 'Compliance Update', event: 'Security training completed by 98%.', icon: 'verified_user', color: 'bg-yellow-100 text-yellow-600' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className={`shrink-0 size-10 rounded-full flex items-center justify-center ${item.color}`}>
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#111827] text-sm">{item.name}</h4>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">{item.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Direct Reports */}
                <div className="soft-card p-6 md:p-8 col-span-1 lg:col-span-2 relative overflow-visible">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h3 className="font-bold text-[#111827]">Direct Reports</h3>
                        <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2 w-full md:w-64">
                            <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
                            <input type="text" placeholder="Search team..." className="bg-transparent border-none outline-none text-sm text-[#111827] w-full placeholder:text-gray-400 font-medium" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                                    <th className="pb-4 pl-2">Employee</th>
                                    <th className="pb-4">Department</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {[
                                    { id: 101, name: 'Alexandria Smith', role: 'Senior UX Designer', dept: 'Creative', status: 'Online', statusColor: 'bg-green-500' },
                                    { id: 102, name: 'James Wilson', role: 'Backend Lead', dept: 'Engineering', status: 'In Meeting', statusColor: 'bg-yellow-500' },
                                    { id: 103, name: 'Elena Rodriguez', role: 'HR Manager', dept: 'Operations', status: 'Away', statusColor: 'bg-gray-300' },
                                ].map((row, i) => (
                                    <tr key={i} className="group hover:bg-gray-50 transition-colors">
                                        <td className="py-4 pl-2">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                                    {/* Placeholder Avatar */}
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-white border-2 border-gray-100 text-xs">{row.name.split(' ').map(n => n[0]).join('')}</div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#111827]">{row.name}</p>
                                                    <p className="text-xs text-gray-500">{row.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${row.dept === 'Creative' ? 'bg-purple-50 text-purple-600' :
                                                row.dept === 'Engineering' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                                }`}>
                                                {row.dept}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`size-2 rounded-full ${row.statusColor}`}></div>
                                                <span className="font-bold text-[#111827] text-xs">{row.status}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right relative">
                                            <button
                                                onClick={() => toggleActionMenu(row.id)}
                                                className="text-gray-400 hover:text-[#3b82f6]"
                                                title="Options"
                                            >
                                                <span className="material-symbols-outlined">more_vert</span>
                                            </button>

                                            {/* Action Dropdown */}
                                            {openActionMenuId === row.id && (
                                                <div className="absolute right-0 top-10 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-30 animate-scaleUp origin-top-right">
                                                    <button className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 text-left">
                                                        <span className="material-symbols-outlined text-[16px]">visibility</span> View Profile
                                                    </button>
                                                    <button className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 text-left">
                                                        <span className="material-symbols-outlined text-[16px]">edit</span> Edit Details
                                                    </button>
                                                    <div className="h-px bg-gray-100 my-1"></div>
                                                    <button className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left">
                                                        <span className="material-symbols-outlined text-[16px]">block</span> Suspend
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Floating Add Button */}
                    <div className="absolute right-6 bottom-6 md:-right-5 md:bottom-12 z-10">
                        <button
                            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                            className="size-14 rounded-full bg-[#3b82f6] text-white shadow-[0_10px_30px_rgba(59,130,246,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                        >
                            <span className={`material-symbols-outlined text-[28px] transition-transform duration-300 ${isAddMenuOpen ? 'rotate-45' : ''}`}>add</span>
                        </button>

                        {/* Quick Action Menu */}
                        {isAddMenuOpen && (
                            <div className="absolute bottom-16 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 animate-scaleUp origin-bottom-right z-20">
                                <Link href="/leave/request" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                                    <span className="material-symbols-outlined text-gray-400">flight_takeoff</span>
                                    Request Leave
                                </Link>
                                <Link href="/tasks" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                                    <span className="material-symbols-outlined text-gray-400">task_alt</span>
                                    New Task
                                </Link>
                                <Link href="/reports" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                                    <span className="material-symbols-outlined text-gray-400">person_add</span>
                                    Add Report
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
