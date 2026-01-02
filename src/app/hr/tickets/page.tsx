'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Ticket {
    _id: string;
    ticketNumber: string;
    subject: string;
    priority: string;
    status: string;
    userId: { firstName: string; lastName: string } | null;
    createdAt: string;
}

export default function HRTicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/tickets')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setTickets(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Helper to count
    const openCount = tickets.filter(t => t.status === 'open').length;
    const closedCount = tickets.filter(t => t.status === 'closed' || t.status === 'resolved').length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Support Tickets</h1>
                </div>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button className="px-4 py-2 bg-[#135bec] text-white rounded-full text-xs font-bold whitespace-nowrap">All ({tickets.length})</button>
                <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold whitespace-nowrap border border-slate-200 dark:border-slate-700">Open ({openCount})</button>
                <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold whitespace-nowrap border border-slate-200 dark:border-slate-700">Closed ({closedCount})</button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading tickets...</div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2">confirmation_number</span>
                    <p>No tickets found.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {tickets.map(tkt => {
                        const userName = tkt.userId ? `${tkt.userId.firstName} ${tkt.userId.lastName}` : 'Unknown User';
                        return (
                            <div key={tkt._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-mono text-xs text-slate-400">{tkt.ticketNumber} • {format(new Date(tkt.createdAt), 'MMM d')}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${tkt.status === 'open' ? 'bg-green-100 text-green-700' :
                                            tkt.status === 'in-progress' ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-100 text-slate-600'
                                        } uppercase`}>{tkt.status}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{tkt.subject}</h3>
                                <p className="text-xs text-slate-500 mb-3">Raised by {userName}</p>

                                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-3">
                                    <span className={`text-xs font-semibold ${tkt.priority === 'high' || tkt.priority === 'urgent' ? 'text-red-500' : 'text-slate-500'} capitalize`}>{tkt.priority} Priority</span>
                                    <button onClick={() => alert('Opening Ticket Detail...')} className="text-[#135bec] text-xs font-bold">Manage</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
