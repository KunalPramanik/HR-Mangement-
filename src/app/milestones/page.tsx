'use client';

export default function MilestonesPage() {
    const milestones = [
        { id: 1, name: 'Sarah Jenkins', event: '5-Year Work Anniversary', date: 'Today', icon: 'celebration', color: 'bg-blue-100 text-blue-600' },
        { id: 2, name: 'Marco Rossi', event: 'New Employee Onboarding', date: 'Yesterday', icon: 'person_add', color: 'bg-green-100 text-green-600' },
        { id: 3, name: 'Compliance Update', event: 'Security training completed by 98%', date: '2 days ago', icon: 'verified_user', color: 'bg-yellow-100 text-yellow-600' },
        { id: 4, name: 'Team Outing', event: 'Quarterly Team Lunch', date: 'Next Friday', icon: 'restaurant', color: 'bg-purple-100 text-purple-600' },
        { id: 5, name: 'System Maintenance', event: 'Scheduled downtime', date: 'Feb 28', icon: 'build', color: 'bg-gray-100 text-gray-600' },
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Milestones & Events</h1>
            <p className="text-slate-500 mb-8">Recent and upcoming organization highlights.</p>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {milestones.map((item) => (
                        <div key={item.id} className="p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <div className={`shrink-0 size-12 rounded-full flex items-center justify-center ${item.color}`}>
                                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-[#111827] dark:text-white text-lg">{item.name}</h4>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.date}</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">{item.event}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
