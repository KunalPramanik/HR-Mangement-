'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function LeaveApprovalsPage() {
    const { data: session } = useSession();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) fetchRequests();
    }, [session]);

    const fetchRequests = async () => {
        const res = await fetch('/api/leaves/adjust');
        if (res.ok) {
            const data = await res.json();
            setRequests(data);
        }
        setLoading(false);
    };

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        const comments = prompt(action === 'APPROVE' ? "Add approval comments (optional):" : "Reason for rejection:");
        if (action === 'REJECT' && !comments) return;

        try {
            const res = await fetch(`/api/leaves/adjust/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, comments })
            });

            if (res.ok) {
                toast.success('Action Successful');
                fetchRequests();
            } else {
                const err = await res.json();
                toast.error('Error: ' + err.error);
            }
        } catch (e) {
            toast.error('Network Error');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Pending Leave Adjustments</h1>

            {requests.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl text-slate-500">
                    No pending requests for your review.
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div key={req._id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${req.adjustmentDays > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {req.adjustmentDays > 0 ? '+' : ''}{req.adjustmentDays} Days
                                    </span>
                                    <span className="text-slate-500 text-sm uppercase font-bold">{req.leaveType}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">
                                    Target: {req.targetUserId?.firstName} {req.targetUserId?.lastName}
                                </h3>
                                <p className="text-sm text-slate-500">Reason: {req.reason}</p>
                                <div className="mt-2 text-xs text-slate-400">
                                    Status: <span className="font-mono bg-slate-100 dark:bg-slate-900 px-1 rounded">{req.status}</span>
                                    <span className="mx-2">•</span>
                                    Requester: {req.requesterId?.firstName}
                                </div>
                            </div>

                            {session?.user.role !== 'admin' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAction(req._id, 'REJECT')}
                                        className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(req._id, 'APPROVE')}
                                        className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors shadow-sm shadow-green-500/20"
                                    >
                                        Approve
                                    </button>
                                </div>
                            )}

                            {session?.user.role === 'admin' && (
                                <span className="text-sm text-slate-400 italic">Waiting for approval...</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
