'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { differenceInBusinessDays, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function LeaveRequestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [leaveType, setLeaveType] = useState('annual');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [totalDays, setTotalDays] = useState(0);

    // Calculate total days when dates change
    useEffect(() => {
        if (startDate && endDate) {
            const start = parseISO(startDate);
            const end = parseISO(endDate);
            if (end >= start) {
                // simple diff + 1 for inclusive, typically business days are better but for now simple
                const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                setTotalDays(diff);
            } else {
                setTotalDays(0);
            }
        } else {
            setTotalDays(0);
        }
    }, [startDate, endDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leaveType,
                    startDate,
                    endDate,
                    reason,
                    totalDays
                }),
            });

            if (res.ok) {
                toast.success('Leave request submitted successfully!');
                router.push('/dashboard');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to submit request');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm pb-4 pt-2">
                <div className="flex items-center gap-3 mb-2">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Request Leave</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex flex-col gap-4">
                {/* Leave Type Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                    <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">
                        Leave Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {['annual', 'sick', 'personal', 'unpaid'].map((type) => (
                            <div
                                key={type}
                                onClick={() => setLeaveType(type)}
                                className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${leaveType === type
                                    ? 'border-[#135bec] bg-[#135bec]/5 text-[#135bec]'
                                    : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <span className="capitalize font-semibold">{type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dates Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                    <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">
                        Duration
                    </label>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Start Date</label>
                            <input
                                type="date"
                                required
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">End Date</label>
                            <input
                                type="date"
                                required
                                value={endDate}
                                min={startDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Duration</span>
                        <span className="text-base font-bold text-[#135bec]">{totalDays} Days</span>
                    </div>
                </div>

                {/* Reason Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                    <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">
                        Reason
                    </label>
                    <textarea
                        required
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please describe why you need this leave..."
                        rows={4}
                        className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec] resize-none"
                    ></textarea>
                </div>

                <div className="p-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#135bec] hover:bg-blue-700 text-white font-bold text-lg p-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {loading && <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>}
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>

            <div className="max-w-lg mx-auto mt-10">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">My Request History</h2>
                <RequestHistory />
            </div>
        </div>
    );
}

function RequestHistory() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/leaves')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setRequests(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-4">Loading history...</div>;
    if (requests.length === 0) return <div className="text-center py-4 text-slate-500">No history found.</div>;

    return (
        <div className="flex flex-col gap-4">
            {requests.map(req => {
                // Determine Approval Info
                let approvalInfo = null;
                if (req.status === 'approved') {
                    // Find who approved
                    const approverStep = req.approvalDetails?.steps?.find((s: any) => s.status === 'approved');

                    let approverName = 'Unknown';
                    let approverRole = '';

                    if (approverStep?.approverId) {
                        approverName = `${approverStep.approverId.firstName} ${approverStep.approverId.lastName}`;
                        approverRole = approverStep.approverId.role;
                    } else if (req.approvedAt) {
                        // Auto-approved case
                        approverName = 'Automatic Approval';
                    }

                    approvalInfo = (
                        <div className="mt-2 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-2 rounded border border-green-100 dark:border-green-900/30">
                            <span className="font-bold">Approved By:</span> {approverName} {approverRole ? `(${approverRole})` : ''}
                        </div>
                    );
                } else if (req.status === 'pending') {
                    // Find pending step
                    const currentStep = req.approvalDetails?.steps?.[req.approvalDetails?.currentStep || 0];
                    if (currentStep) {
                        const pendingWith = currentStep.specificApproverId
                            ? `${currentStep.specificApproverId.firstName} ${currentStep.specificApproverId.lastName}`
                            : (currentStep.requiredRole || 'Manager');

                        approvalInfo = (
                            <div className="mt-2 text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 p-2 rounded border border-orange-100 dark:border-orange-900/30">
                                <span className="font-bold">Pending With:</span> {pendingWith} {currentStep.requiredRole ? `(${currentStep.requiredRole})` : ''}
                            </div>
                        );
                    } else {
                        approvalInfo = (
                            <div className="mt-2 text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 p-2 rounded border border-orange-100 dark:border-orange-900/30">
                                <span className="font-bold">Pending With:</span> Manager / HR
                            </div>
                        );
                    }
                }

                return (
                    <div key={req._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white capitalize">{req.leaveType} Leave</h3>
                                <p className="text-xs text-slate-500">
                                    {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                </p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${req.status === 'approved' ? 'bg-green-100 text-green-600' :
                                req.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                    'bg-orange-100 text-orange-600'
                                }`}>{req.status}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-2">"{req.reason}"</p>
                        {approvalInfo}
                    </div>
                );
            })}
        </div>
    );
}
