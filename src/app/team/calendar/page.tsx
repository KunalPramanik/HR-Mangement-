'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    type: 'holiday' | 'leave' | 'event';
    user: any;
    details?: string;
}

export default function TeamCalendarPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/calendar');
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Failed to fetch calendar events', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const prevMonthDays = new Date(year, month, 0).getDate();

        // Mondays as start of week logic if needed, but standard is Sunday = 0
        // Currently using Sunday start.

        return { days, firstDay, prevMonthDays };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getEventsForDate = (day: number) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        checkDate.setHours(0, 0, 0, 0);

        return events.filter(event => {
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            return checkDate >= startDate && checkDate <= endDate;
        });
    };

    const getEventStyle = (event: CalendarEvent) => {
        const title = event.title.toLowerCase();

        if (event.type === 'holiday') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        if (event.type === 'leave') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800';

        // Custom keywords
        if (title.includes('meeting')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        if (title.includes('visit')) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
        if (title.includes('lunch') || title.includes('party')) return 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800';

        // Default Event
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    };

    const formatEventTime = (dateStr: string) => {
        const date = new Date(dateStr);
        // If it's midnight, assume all day (omit time)
        if (date.getHours() === 0 && date.getMinutes() === 0) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderCalendarGrid = () => {
        const blanks = Array.from({ length: firstDay }, (_, i) => (
            <div key={`blank-${i}`} className="bg-slate-50 dark:bg-slate-900/50 min-h-[120px] border-b border-r border-slate-200 dark:border-slate-700"></div>
        ));

        const dayCells = Array.from({ length: days }, (_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDate(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
                <div
                    key={`day-${day}`}
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`min-h-[120px] bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer ${isToday ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {day}
                        </span>
                        {dayEvents.length > 0 && (
                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md text-slate-600 dark:text-slate-300">
                                {dayEvents.length}
                            </span>
                        )}
                    </div>
                    <div className="space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map(event => {
                            const time = formatEventTime(event.start);
                            return (
                                <div
                                    key={event.id}
                                    className={`text-[10px] px-1.5 py-1 rounded border truncate font-medium flex gap-1 ${getEventStyle(event)}`}
                                    title={`${time ? time + ' ' : ''}${event.title}`}
                                >
                                    {time && <span className="opacity-75">{time}</span>}
                                    <span>
                                        {event.type === 'holiday' && '🎉 '}
                                        {event.title}
                                    </span>
                                </div>
                            );
                        })}
                        {dayEvents.length > 3 && (
                            <div className="text-[10px] text-slate-500 font-medium pl-1">
                                +{dayEvents.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            );
        });

        return [...blanks, ...dayCells];
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Calendar</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">View holidays, leaves, and events</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">chevron_left</span>
                    </button>
                    <span className="min-w-[140px] text-center font-bold text-slate-800 dark:text-white">
                        {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">chevron_right</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {loading ? (
                        <div className="col-span-7 h-96 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        renderCalendarGrid()
                    )}
                </div>
            </div>

            {selectedDate && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedDate(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {selectedDate.toLocaleDateString('default', { dateStyle: 'full' })}
                            </h3>
                            <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {getEventsForDate(selectedDate.getDate()).length > 0 ? (
                                getEventsForDate(selectedDate.getDate()).map(event => (
                                    <div key={event.id} className={`p-4 rounded-xl border-l-4 ${event.type === 'holiday' ? 'bg-purple-50 border-purple-500 dark:bg-purple-900/20' :
                                        event.type === 'leave' ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20' :
                                            'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
                                        }`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{event.title}</h4>
                                                <p className="text-sm text-slate-500 mt-1 capitalize">{event.type}</p>
                                            </div>
                                            {event.type === 'holiday' && <span className="material-symbols-outlined text-purple-500">celebration</span>}
                                            {event.type === 'leave' && <span className="material-symbols-outlined text-orange-500">flight</span>}
                                            {event.type === 'event' && <span className="material-symbols-outlined text-blue-500">event</span>}
                                        </div>
                                        {event.details && (
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                                                {event.details}
                                            </p>
                                        )}
                                        {event.start !== event.end && (
                                            <p className="text-xs text-slate-400 mt-2">
                                                {new Date(event.start).toLocaleDateString()} - {new Date(event.end).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <p>No events for this day.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
