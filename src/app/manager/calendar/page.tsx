'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, parseISO } from 'date-fns';

interface Leave {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
    leaveType: string;
    startDate: string;
    endDate: string;
    status: string;
}

export default function ManagerTeamCalendar() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await fetch('/api/leave');
            if (res.ok) {
                const data = await res.json();
                // Filter only approved leaves for the calendar view to avoid clutter
                // or maybe show pending in a different color? Let's show all for visibility.
                if (Array.isArray(data)) {
                    setLeaves(data.filter((l: any) => l.status === 'approved' || l.status === 'pending'));
                }
            }
        } catch (error) {
            console.error('Error fetching calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const jumpToToday = () => setCurrentDate(new Date());

    // Calendar Grid Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const getLeaveColor = (type: string) => {
        switch (type) {
            case 'annual': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'sick': return 'bg-red-100 text-red-700 border-red-200';
            case 'personal': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Team Schedule</h1>
                        <p className="text-xs text-slate-500">Overview of team availability and leaves</p>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <span className="font-bold text-slate-900 dark:text-white px-4 min-w-[140px] text-center">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Calendar Container */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] divide-x divide-slate-200 dark:divide-slate-700">
                    {calendarDays.map((day, dayIdx) => {
                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, monthStart);

                        // Find leaves for this day
                        const dayLeaves = leaves.filter(leave =>
                            isWithinInterval(day, {
                                start: parseISO(leave.startDate),
                                end: parseISO(leave.endDate)
                            })
                        );

                        return (
                            <div
                                key={day.toString()}
                                className={`
                                    relative p-2 transition-colors min-h-[120px]
                                    ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-900/50 text-slate-400' : 'bg-white dark:bg-slate-800'}
                                    ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`
                                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                        ${isToday ? 'bg-[#135bec] text-white' : 'text-slate-700 dark:text-slate-300'}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                {/* Events Stack */}
                                <div className="flex flex-col gap-1 overflow-y-auto max-h-[90px] no-scrollbar">
                                    {dayLeaves.map(leave => (
                                        <div
                                            key={leave._id}
                                            title={`${leave.userId.firstName} ${leave.userId.lastName} - ${leave.leaveType}`}
                                            className={`
                                                px-2 py-1 rounded text-[10px] font-bold border truncate flex items-center gap-1
                                                ${getLeaveColor(leave.leaveType)}
                                                ${leave.status === 'pending' ? 'opacity-60 border-dashed' : ''}
                                            `}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0"></div>
                                            {leave.userId.firstName}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></span> Annual Leave
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-red-100 border border-red-200"></span> Sick Leave
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-purple-100 border border-purple-200"></span> Personal
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded border border-slate-300 border-dashed bg-slate-50"></span> Pending Approval
                </div>
            </div>
        </div>
    );
}
