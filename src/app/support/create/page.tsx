'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: 'technical',
        subject: '',
        description: '',
        priority: 'medium'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Ticket Created Successfully! Ref: ${data.ticketNumber}`);
                router.push('/support');
            } else {
                alert('Failed to create ticket');
            }
        } catch (err) {
            console.error(err);
            alert('Error creating ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Raise a Ticket</h1>
            </div>

            <form className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-4" onSubmit={handleSubmit}>
                <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Issue Type</span>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                    >
                        <option value="technical">IT Support</option>
                        <option value="hr">HR Inquiry</option>
                        <option value="facilities">Facilities</option>
                        <option value="payroll">Payroll Discrepancy</option>
                        <option value="leave">Leave & Attendance</option>
                        <option value="other">Other</option>
                    </select>
                </label>

                <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject</span>
                    <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                        placeholder="Brief summary of issue"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</span>
                    <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                        placeholder="Detailed explanation..."
                    ></textarea>
                </label>

                <div className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</span>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="priority"
                                value="low"
                                checked={formData.priority === 'low'}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="text-[#135bec] focus:ring-[#135bec]"
                            />
                            <span className="text-sm">Low</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="priority"
                                value="medium"
                                checked={formData.priority === 'medium'}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="text-[#135bec] focus:ring-[#135bec]"
                            />
                            <span className="text-sm">Medium</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="priority"
                                value="high"
                                checked={formData.priority === 'high'}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="text-[#135bec] focus:ring-[#135bec]"
                            />
                            <span className="text-sm">High</span>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full bg-[#135bec] text-white font-bold p-4 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                    {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
            </form>
        </div>
    );
}
