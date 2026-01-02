'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

export default function HolidayManagement() {
    const { data: session } = useSession();
    const router = useRouter();
    const [holidays, setHolidays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', date: '', type: 'public' });

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        const res = await fetch('/api/holidays');
        if (res.ok) setHolidays(await res.json());
        setLoading(false);
    };

    const seedHolidays = async () => {
        setLoading(true);
        await fetch('/api/holidays', { method: 'PUT' }); // Triggers seed
        fetchHolidays();
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this holiday?')) return;
        await fetch(`/api/holidays?id=${id}`, { method: 'DELETE' });
        fetchHolidays();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/holidays', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            setShowModal(false);
            setFormData({ name: '', date: '', type: 'public' });
            fetchHolidays();
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 pb-24">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Holiday Management</h1>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={seedHolidays}
                        disabled={loading}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">dataset</span> Load Indian Holidays
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#135bec] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">add</span> Add Holiday
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {holidays.map(holiday => (
                    <div key={holiday._id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-start">
                        <div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded mb-2 inline-block ${holiday.type === 'public' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                {holiday.type}
                            </span>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{holiday.name}</h3>
                            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                {format(new Date(holiday.date), 'MMMM d, yyyy')}
                            </p>
                        </div>
                        <button onClick={() => handleDelete(holiday._id)} className="text-slate-400 hover:text-red-600">
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Holiday</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-bold dark:text-white">Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-bold dark:text-white">Date</label>
                                <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-bold dark:text-white">Type</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white">
                                    <option value="public">Public</option>
                                    <option value="company">Company</option>
                                </select>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 py-2 rounded font-bold">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
