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
    approvedAt?: string;
    approverId?: string;
}

export default function HRLeaveApprovalsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'all'>('pending');

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await fetch('/api/leaves');
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const displayedRequests = filter === 'pending'
        ? requests.filter(r => r.status === 'pending')
        : requests;

    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        try {
            const res = await fetch(`/api/leaves/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            });

            if (res.ok) {
                // Update local state instead of refetching to keep UI smooth
                setRequests(prev => prev.map(r => r._id === id ? { ...r, status: action } : r));
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
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Leave Requests (HR)</h1>
                </div>
                <button onClick={fetchLeaves} className="text-sm font-bold text-[#135bec]">Refresh</button>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
                <button
                    onClick={() => setFilter('pending')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${filter === 'pending' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                    Pending
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${filter === 'all' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                    All History
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="flex flex-col gap-4">
                    {displayedRequests.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                            <p>No {filter} requests found.</p>
                        </div>
                    ) : displayedRequests.map(req => {
                        const user = req.userId || { firstName: 'Unknown', lastName: 'User', role: 'N/A' };
                        const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

                        return (
                            <div key={req._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700`}>
                                            {initials}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</h3>
                                            <p className="text-xs text-slate-500">{user.role}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${req.status === 'approved' ? 'bg-green-100 text-green-600' :
                                        req.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                            'bg-orange-100 text-orange-600'
                                        }`}>{req.status}</span>
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

                                    {req.status === 'approved' && (
                                        <div className="mt-2 text-xs text-green-700 bg-green-50 p-1 px-2 rounded-md inline-block border border-green-200">
                                            <strong>Approved By:</strong> {req.approvedAt && !req.approverId ? 'Automatic Approval' : 'Reviewer'}
                                        </div>
                                    )}
                                </div>

                                {req.status === 'pending' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => handleAction(req._id, 'rejected')} className="py-2 rounded-lg border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors">Reject</button>
                                        <button onClick={() => handleAction(req._id, 'approved')} className="py-2 rounded-lg bg-[#135bec] text-white font-bold text-sm hover:bg-blue-700 transition-colors">Approve</button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
