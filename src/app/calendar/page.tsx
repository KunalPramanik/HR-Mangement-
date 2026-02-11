'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Mock Events
    const events = [
        { date: new Date(2025, 0, 15), title: 'Team Sync', type: 'meeting' }, // Jan 15
        { date: new Date(), title: 'Project Deadline', type: 'deadline' }, // Today
        { date: addMonths(new Date(), 0), title: 'Pay Day', type: 'pay' }, // This month generic
    ];

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">Calendar</h1>
                    <p className="text-[#6b7280] font-medium">Schedule meetings and view events.</p>
                </div>
                <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <button onClick={prevMonth} className="size-10 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-500">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <div className="flex items-center justify-center px-4 font-bold text-[#111827] w-32">
                        {format(currentMonth, 'MMMM yyyy')}
                    </div>
                    <button onClick={nextMonth} className="size-10 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-500">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 soft-card p-6">
                    <div className="grid grid-cols-7 mb-4">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase py-2">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                        {days.map((day, i) => {
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isCurrentDay = isToday(day);

                            return (
                                <div
                                    key={i}
                                    onClick={() => setSelectedDate(day)}
                                    className={`bg-white min-h-[100px] p-2 cursor-pointer hover:bg-blue-50 transition-colors flex flex-col items-start justify-between
                                    ${!isCurrentMonth ? 'text-gray-300 bg-gray-50/50' : 'text-gray-700'}
                                    ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-500 z-10' : ''}`}
                                >
                                    <span className={`text-sm font-bold size-7 flex items-center justify-center rounded-full ${isCurrentDay ? 'bg-[#3b82f6] text-white' : ''}`}>
                                        {format(day, dateFormat)}
                                    </span>

                                    {/* Event Dots */}
                                    <div className="flex gap-1 mt-1 w-full flex-wrap">
                                        {isCurrentDay && <div className="w-full h-1.5 rounded-full bg-red-400 mb-1" title="Deadline"></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar / Events List */}
                <div className="flex flex-col gap-6">
                    <div className="soft-card p-6 h-full">
                        <h3 className="font-bold text-[#111827] mb-4 flex items-center justify-between">
                            <span>Events for {format(selectedDate, 'MMM d')}</span>
                            <button className="text-[#3b82f6] text-sm font-bold flex items-center gap-1 hover:underline">
                                <span className="material-symbols-outlined text-[18px]">add</span> Add
                            </button>
                        </h3>

                        <div className="space-y-4">
                            {isToday(selectedDate) ? (
                                <>
                                    <div className="p-4 rounded-xl bg-blue-50 border-l-4 border-blue-500">
                                        <p className="text-xs font-bold text-blue-500 mb-1">10:00 AM - 11:30 AM</p>
                                        <h4 className="font-bold text-[#111827]">Product Design Review</h4>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">videocam</span> Zoom
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-purple-50 border-l-4 border-purple-500">
                                        <p className="text-xs font-bold text-purple-500 mb-1">02:00 PM - 03:00 PM</p>
                                        <h4 className="font-bold text-[#111827]">1:1 with Manager</h4>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">meeting_room</span> Room 3B
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                                    <p>No events scheduled for this day.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
