'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function TimesheetsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        project: '',
        task: '',
        hours: '',
        description: '',
        billable: true
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/timesheets');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/timesheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Time logged successfully');
                setFormData({ ...formData, task: '', hours: '', description: '' });
                fetchLogs();
            } else {
                toast.error('Failed to log time');
            }
        } catch (e) {
            toast.error('Network error');
        } finally {
            setSubmitting(false);
        }
    };

    const totalHours = logs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0);

    return (
        <div className="p-8 max-w-[1600px] mx-auto pb-20">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#111827]">Timesheets</h1>
                    <p className="text-gray-500">Track your daily tasks and billable hours.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-6 py-2 rounded-xl font-bold border border-blue-100">
                    Total Hours: {totalHours.toFixed(1)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                        <h2 className="text-lg font-bold mb-4">Log Time</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Project</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Website Redesign"
                                    value={formData.project}
                                    onChange={e => setFormData({ ...formData, project: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Task</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Frontend Dev"
                                    value={formData.task}
                                    onChange={e => setFormData({ ...formData, task: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hours</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.1"
                                        min="0.1"
                                        max="24"
                                        value={formData.hours}
                                        onChange={e => setFormData({ ...formData, hours: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={formData.billable}
                                            onChange={e => setFormData({ ...formData, billable: e.target.checked })}
                                            className="size-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className="text-sm font-bold text-gray-700">Billable</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#111827] text-white font-bold py-3 rounded-xl hover:bg-black transition shadow-lg shadow-gray-400/20 disabled:opacity-70"
                            >
                                {submitting ? 'Saving...' : 'Add Entry'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Project / Task</th>
                                    <th className="px-6 py-4">Hours</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No time logs found.</td></tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{new Date(log.date).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{log.project}</div>
                                                <div className="text-xs text-gray-500">{log.task}</div>
                                                {log.description && <div className="text-xs text-gray-400 mt-1 italic">{log.description}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{log.hours}h</div>
                                                {log.billable && <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Billable</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${log.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                        log.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
