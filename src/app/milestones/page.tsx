'use client';

import Link from 'next/link';

export default function MilestonesPage() {
    const milestones = [
        { title: 'New Office Opening', date: 'Jan 15, 2025', desc: 'We are expanding to a new location in downtown.', type: 'announcement', color: 'bg-purple-100 text-purple-600', icon: 'campaign' },
        { title: 'Project Zenith Launch', date: 'Jan 12, 2025', desc: 'The biggest client project of the year goes live.', type: 'milestone', color: 'bg-blue-100 text-[#3b82f6]', icon: 'rocket_launch' },
        { title: 'Employee Appreciation Day', date: 'Jan 05, 2025', desc: 'Celebrating our amazing team with a party!', type: 'event', color: 'bg-pink-100 text-pink-600', icon: 'celebration' },
        { title: 'Q4 Financial Results', date: 'Jan 02, 2025', desc: 'Record breaking performance in the last quarter.', type: 'report', color: 'bg-green-100 text-green-600', icon: 'trending_up' },
        { title: 'Safety Training Refresh', date: 'Jan 01, 2025', desc: 'Mandatory annual fire safety training.', type: 'compliance', color: 'bg-orange-100 text-orange-600', icon: 'policy' },
        { title: 'New Hire Orientation', date: 'Dec 28, 2024', desc: 'Welcoming 5 new members to the engineering team.', type: 'hr', color: 'bg-yellow-100 text-yellow-600', icon: 'group_add' },
    ];

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">Milestones & News</h1>
                    <p className="text-[#6b7280] font-medium">Keep up to date with the latest company events.</p>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {milestones.map((m, i) => (
                    <div key={i} className="soft-card p-6 flex flex-col justify-start h-full hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${m.color} bg-opacity-20`}>
                                <span className={`material-symbols-outlined text-[28px]`}>{m.icon}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">{m.date}</span>
                        </div>
                        <h3 className="font-bold text-lg text-[#111827] mb-2">{m.title}</h3>
                        <p className="text-sm text-gray-500 mb-4 flex-grow">{m.desc}</p>
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className={`text-xs font-bold uppercase tracking-wider ${m.color} bg-transparent`}>{m.type}</span>
                            <button className="text-[#3b82f6] text-sm font-bold hover:underline">Read More</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
