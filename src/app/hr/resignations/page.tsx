'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function HRResignationsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        const res = await fetch('/api/resignations');
        if (res.ok) setRequests(await res.json());
        setLoading(false);
    };

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${status} this request?`)) return;

        const res = await fetch('/api/resignations', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });

        if (res.ok) fetchRequests();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Resignation Requests</h1>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="p-4">Employee</th>
                            <th className="p-4">Reason</th>
                            <th className="p-4">Last Day</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No pending requests.</td></tr>
                        ) : requests.map(req => (
                            <tr key={req._id} className="border-b border-slate-100 dark:border-slate-700">
                                <td className="p-4 font-bold text-slate-900 dark:text-white">
                                    {req.userId?.firstName} {req.userId?.lastName}
                                    <div className="text-xs font-normal text-slate-500">{req.userId?.role}</div>
                                </td>
                                <td className="p-4 max-w-xs truncate text-slate-600 dark:text-slate-300" title={req.reason}>{req.reason}</td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">{format(new Date(req.intendedLastDay), 'MMM d, yyyy')}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${req.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                            req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    {req.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleAction(req._id, 'approved')} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700">Approve</button>
                                            <button onClick={() => handleAction(req._id, 'rejected')} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700">Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
