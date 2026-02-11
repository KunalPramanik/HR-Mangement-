'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [isOnDuty, setIsOnDuty] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleShift = () => setIsOnDuty(!isOnDuty);

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">System Terminal</h1>
                    <p className="text-[#6b7280] font-medium">Welcome back, Administrator. Your organization's health is optimal.</p>
                </div>
                <div className="flex bg-white p-1 rounded-full shadow-sm border border-gray-100">
                    <button className="px-6 py-2 rounded-full bg-[#111827] text-white font-bold text-sm shadow-md transition-all">Dashboard</button>
                    <button className="px-6 py-2 rounded-full text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all">Management</button>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Attendance */}
                <div className="soft-card p-8 flex items-center justify-between relative overflow-hidden group">
                    <div className="relative size-24">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" strokeDasharray="92, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#111827]">92%</div>
                    </div>
                    <div className="text-right z-10">
                        <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">Attendance</p>
                        <h3 className="text-2xl font-extrabold text-[#111827] mb-1">Excellent</h3>
                        <p className="text-sm font-bold text-[#10b981]">↗ +4.2%</p>
                    </div>
                </div>

                {/* Card 2: Open Tasks */}
                <div className="soft-card p-8 flex items-center justify-between relative overflow-hidden group">
                    <div className="relative size-24">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-[#8b5cf6] drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" strokeDasharray="14, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#111827]">14</div>
                    </div>
                    <div className="text-right z-10">
                        <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">Open Tasks</p>
                        <h3 className="text-2xl font-extrabold text-[#111827] mb-1">On Track</h3>
                        <p className="text-sm font-bold text-[#3b82f6]">🕒 3 due today</p>
                    </div>
                </div>

                {/* Card 3: Sentiment */}
                <div className="soft-card p-8 flex items-center justify-between relative overflow-hidden group">
                    <div className="relative size-24">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-[#ef4444] drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" strokeDasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#111827]">4.8</div>
                    </div>
                    <div className="text-right z-10">
                        <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">Sentiment</p>
                        <h3 className="text-2xl font-extrabold text-[#111827] mb-1">High Peak</h3>
                        <p className="text-sm font-bold text-[#ef4444]">❤ Top 5% Org</p>
                    </div>
                </div>
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Workstation Status */}
                <div className="soft-card p-8 flex flex-col justify-between h-[400px]">
                    <div>
                        <p className="text-xs font-bold text-gray-400 tracking-wider uppercase text-center mb-8">Workstation Status</p>

                        <div className="bg-gray-100 rounded-full p-2 flex items-center justify-between relative w-full max-w-[280px] mx-auto mb-10 h-16">
                            <span className={`flex-1 text-center text-sm font-bold z-10 transition-colors ${!isOnDuty ? 'text-gray-900' : 'text-gray-400'}`}>OFF DUTY</span>
                            <span className={`flex-1 text-center text-sm font-bold z-10 transition-colors ${isOnDuty ? 'text-[#10b981]' : 'text-gray-400'}`}>ON DUTY</span>

                            {/* Toggle Pill */}
                            <div
                                onClick={toggleShift}
                                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-center
                                ${isOnDuty ? 'left-[calc(50%+2px)] bg-white' : 'left-1 bg-white'}`}
                            >
                                <div className={`size-8 rounded-full transition-colors ${isOnDuty ? 'bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-gray-300'}`}></div>
                            </div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-5xl font-mono font-bold text-[#111827] mb-2 tracking-tighter">
                                {time.toLocaleTimeString([], { hour12: false })}
                            </h2>
                            <p className="text-gray-400 font-medium">Shift started at 08:00 AM</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 py-3 bg-white border border-gray-100 shadow-sm rounded-xl font-bold text-[#111827] hover:bg-gray-50">TAKE BREAK</button>
                        <button className="flex-1 py-3 bg-white border border-gray-100 shadow-sm rounded-xl font-bold text-[#ef4444] hover:bg-red-50">END SHIFT</button>
                    </div>
                </div>

                {/* Performance Metrics Chart */}
                <div className="soft-card p-8 col-span-2 h-[400px] flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-[#111827]">Performance Metrics</h3>
                            <p className="text-gray-500 text-sm">Global efficiency across all departments</p>
                        </div>
                        <button className="size-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4">
                        {[40, 65, 50, 80, 75, 25, 15].map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-full bg-[#3b82f6]/10 rounded-t-2xl relative h-[200px] flex items-end group-hover:bg-[#3b82f6]/20 transition-colors overflow-hidden">
                                    <div
                                        style={{ height: `${height}%` }}
                                        className={`w-full rounded-t-xl transition-all duration-500 ${height > 50 ? 'bg-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-[#93c5fd]'}`}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Milestones */}
                <div className="soft-card p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-[#111827]">Recent Milestones</h3>
                        <Link href="#" className="text-xs font-bold text-[#3b82f6]">VIEW ALL</Link>
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
                <div className="soft-card p-8 col-span-2 relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-[#111827]">Direct Reports</h3>
                        <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2 w-64">
                            <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
                            <input type="text" placeholder="Search team..." className="bg-transparent border-none outline-none text-sm text-[#111827] w-full placeholder:text-gray-400 font-medium" />
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse">
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
                                { name: 'Alexandria Smith', role: 'Senior UX Designer', dept: 'Creative', status: 'Online', statusColor: 'bg-green-500' },
                                { name: 'James Wilson', role: 'Backend Lead', dept: 'Engineering', status: 'In Meeting', statusColor: 'bg-yellow-500' },
                                { name: 'Elena Rodriguez', role: 'HR Manager', dept: 'Operations', status: 'Away', statusColor: 'bg-gray-300' },
                            ].map((row, i) => (
                                <tr key={i} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-4 pl-2">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-gray-200 overflow-hidden">
                                                {/* Placeholder Avatar */}
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-white border-2 border-gray-100">{row.name[0]}</div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#111827]">{row.name}</p>
                                                <p className="text-xs text-gray-500">{row.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${row.dept === 'Creative' ? 'bg-purple-50 text-purple-600' :
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
                                    <td className="py-4 text-right">
                                        <button className="text-gray-400 hover:text-[#3b82f6]">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Floating Add Button */}
                    <button className="absolute -right-5 bottom-12 size-14 rounded-full bg-[#3b82f6] text-white shadow-[0_10px_30px_rgba(59,130,246,0.4)] flex items-center justify-center hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[28px]">add</span>
                    </button>
                </div>
            </div>

        </div>
    );
}
