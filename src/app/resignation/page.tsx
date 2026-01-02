'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResignationPage() {
    const router = useRouter();
    const [reason, setReason] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch('/api/resignations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason, intendedLastDay: date })
        });

        if (res.ok) {
            router.push('/dashboard');
            alert('Resignation request submitted.');
        } else {
            alert('Failed to submit.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg max-w-md w-full border border-red-100 dark:border-red-900/30">
                <div className="flex flex-col items-center mb-6">
                    <div className="size-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 mb-4">
                        <span className="material-symbols-outlined text-3xl">person_remove</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Submit Resignation</h1>
                    <p className="text-slate-500 text-center text-sm mt-2">We're sorry to see you go. Please provide details below.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Reason for Leaving</label>
                        <textarea
                            required
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-h-[100px]"
                            placeholder="Please share why you are resigning..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Intended Last Working Day</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                        />
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
