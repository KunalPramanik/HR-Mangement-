'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SupportPage() {
    const router = useRouter();
    const [faqOpen, setFaqOpen] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Help & Support</h1>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button onClick={() => router.push('/support/create')} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center gap-2 hover:border-[#135bec] transition-all">
                    <div className="size-10 bg-[#135bec]/10 text-[#135bec] rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined">add_circle</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Raise Ticket</span>
                </button>
                <button onClick={() => alert('No active tickets')} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center gap-2 hover:border-[#135bec] transition-all">
                    <div className="size-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined">history</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">My Tickets</span>
                </button>
            </div>

            {/* FAQ */}
            <h2 className="font-bold text-slate-900 dark:text-white mb-3">Frequently Asked Questions</h2>
            <div className="flex flex-col gap-3">
                {[
                    { id: 1, q: 'How do I reset my password?', a: 'Go to Settings > Account > Change Password.' },
                    { id: 2, q: 'How is leave balance calculated?', a: 'Leave is accrued monthly based on your contract type.' },
                    { id: 3, q: 'Where can I find tax documents?', a: 'Tax documents are available in the Payslips section.' },
                ].map((item) => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <button
                            onClick={() => setFaqOpen(faqOpen === item.id ? null : item.id)}
                            className="w-full flex justify-between items-center p-4 text-left font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                            {item.q}
                            <span className="material-symbols-outlined text-slate-400">{faqOpen === item.id ? 'expand_less' : 'expand_more'}</span>
                        </button>
                        {faqOpen === item.id && (
                            <div className="p-4 pt-0 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                {item.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
