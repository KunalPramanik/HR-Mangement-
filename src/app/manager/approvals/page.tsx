'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface LeaveRequest {
    _id: string;
    userId: {
        firstName: string;
        lastName: string;
        role: string;
        initials?: string;
    } | null;
    startDate: string;
    endDate: string;
    leaveType: string;
    reason: string;
    status: string;
}

export default function ManagerApprovalsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await fetch('/api/leaves');
            if (res.ok) {
                const data = await res.json();
                // Filter only 'pending' for this view
                const pending = data.filter((r: LeaveRequest) => r.status === 'pending');
                setRequests(pending);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        try {
            const res = await fetch(`/api/leaves/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            });

            if (res.ok) {
                // Remove from list
                setRequests(requests.filter(r => r._id !== id));
                toast.success(`Request ${action} successfully`);
            } else {
                toast.error('Action failed');
            }
        } catch (error) {
            toast.error('Error processing request');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Pending Team Approvals</h1>
                </div>
                <button onClick={() => router.push('/team/calendar')} className="p-2 text-[#135bec] bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <span className="material-symbols-outlined">calendar_month</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="flex flex-col gap-4">
                    {requests.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                            <p>No pending approvals!</p>
                        </div>
                    ) : requests.map(req => {
                        const user = req.userId || { firstName: 'Unknown', lastName: 'User', role: 'N/A' };
                        const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

                        return (
                            <div key={req._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700`}>
                                            {initials}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</h3>
                                            <p className="text-xs text-slate-500">{user.role}</p>
                                        </div>
                                    </div>
                                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded capitalize">{req.status}</span>
                                </div>

                                <div className="my-3 py-3 border-y border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-500">Dates</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {format(new Date(req.startDate), 'MMM d')} - {format(new Date(req.endDate), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Type</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{req.leaveType}</span>
                                    </div>
                                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded italic">
                                        "{req.reason}"
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleAction(req._id, 'rejected')} className="flex-1 py-2 text-xs font-bold text-red-600 bg-slate-100 rounded-lg">Reject</button>
                                    <button onClick={() => handleAction(req._id, 'approved')} className="flex-1 py-2 text-xs font-bold text-white bg-[#135bec] rounded-lg">Approve</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
