'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export default function TimesheetsPage() {
    const { data: session } = useSession();
    const [timesheets, setTimesheets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [view, setView] = useState('my'); // 'my' or 'all' (for admin)

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        project: '',
        task: '',
        hours: 8,
        description: '',
        billable: true
    });

    const isAdmin = ['hr', 'admin', 'director', 'manager'].includes(session?.user?.role || '');

    useEffect(() => {
        fetchTimesheets();
    }, [view]);

    const fetchTimesheets = async () => {
        try {
            setLoading(true);
            const url = view === 'all' && isAdmin ? '/api/timesheets' : `/api/timesheets?userId=${session?.user?.id}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setTimesheets(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/timesheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Time logged successfully');
                setShowModal(false);
                fetchTimesheets();
            } else {
                toast.error('Failed to log time');
            }
        } catch (error) {
            toast.error('Error logging time');
        }
    };

    const handleApprove = async (id: string) => {
        await fetch('/api/timesheets', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'Approved' })
        });
        toast.success('Approved');
        fetchTimesheets();
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Time Tracking</h1>
                    <p className="text-slate-500 mt-1">Log and manage project hours.</p>
                </div>
                <div className="flex gap-3">
                    {isAdmin && (
                        <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-bold">
                            <button onClick={() => setView('my')} className={`px-4 py-2 rounded-md transition ${view === 'my' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>My Logs</button>
                            <button onClick={() => setView('all')} className={`px-4 py-2 rounded-md transition ${view === 'all' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Team Logs</button>
                        </div>
                    )}
                    <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-500/30">
                        <span className="material-symbols-outlined">add_circle</span>
                        Log Time
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                {view === 'all' && <th className="px-6 py-4">Employee</th>}
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4">Task</th>
                                <th className="px-6 py-4">Hours</th>
                                <th className="px-6 py-4">Status</th>
                                {view === 'all' && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {timesheets.map(ts => (
                                <tr key={ts._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                        {new Date(ts.date).toLocaleDateString()}
                                    </td>
                                    {view === 'all' && (
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            {ts.userId?.firstName} {ts.userId?.lastName}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        {ts.project}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {ts.task}
                                        <div className="text-xs text-slate-400">{ts.description}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                        {ts.hours}h
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ts.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                ts.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {ts.status}
                                        </span>
                                    </td>
                                    {view === 'all' && (
                                        <td className="px-6 py-4 text-right">
                                            {ts.status === 'Pending' && (
                                                <button onClick={() => handleApprove(ts._id)} className="text-green-600 hover:bg-green-50 px-3 py-1 rounded font-bold text-xs transition">
                                                    Approve
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {timesheets.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        No timesheets found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Log Time</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                    <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Hours</label>
                                    <input type="number" step="0.5" required value={formData.hours} onChange={e => setFormData({ ...formData, hours: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Project</label>
                                <input required value={formData.project} onChange={e => setFormData({ ...formData, project: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" placeholder="e.g. Acme Corp Redesign" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Task</label>
                                <input required value={formData.task} onChange={e => setFormData({ ...formData, task: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" placeholder="e.g. Frontend Development" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none resize-none" />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 mt-2">
                                Submit Log
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
