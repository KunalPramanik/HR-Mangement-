'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function LeaveRequestPage() {
    const [formData, setFormData] = useState({
        type: 'Annual Leave',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/leave/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Leave Request Submitted Successfully');
                setFormData({ type: 'Annual Leave', startDate: '', endDate: '', reason: '' });
            } else {
                toast.error(data.error || 'Failed to submit request');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Request Leave</h1>
            <p className="text-slate-500 mb-8">Submit your absence request for approval.</p>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Leave Type</label>
                    <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-slate-700 border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    >
                        <option>Annual Leave</option>
                        <option>Sick Leave</option>
                        <option>Personal Leave</option>
                        <option>Bereavement</option>
                        <option>Unpaid Leave</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                        <input
                            type="date"
                            required
                            value={formData.startDate}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border dark:bg-slate-700 border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                        <input
                            type="date"
                            required
                            value={formData.endDate}
                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border dark:bg-slate-700 border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Reason (Optional)</label>
                    <textarea
                        rows={4}
                        value={formData.reason}
                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-slate-700 border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none"
                        placeholder="Please provide details..."
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 text-lg flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">send</span>
                        Submit Request
                    </button>
                </div>
            </form>
        </div>
    );
}
