'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ResignationPage() {
    const router = useRouter();
    const [resignations, setResignations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        reason: '',
        intendedLastDay: ''
    });

    useEffect(() => {
        fetchResignations();
    }, []);

    const fetchResignations = async () => {
        try {
            const res = await fetch('/api/resignation');
            if (res.ok) {
                const data = await res.json();
                setResignations(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/resignation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Resignation submitted successfully.');
                setFormData({ reason: '', intendedLastDay: '' });
                fetchResignations();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Submission failed');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setSubmitting(false);
        }
    };

    const hasActiveResignation = resignations.some(r => r.status === 'pending');

    return (
        <div className="p-8 max-w-[1200px] mx-auto pb-20">
            <h1 className="text-3xl font-extrabold text-[#111827] mb-2">Resignation & Exit</h1>
            <p className="text-gray-500 mb-8">Process your separation from the company formally.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Submission Form */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="text-xl font-bold mb-4">Submit Resignation</h2>
                    {hasActiveResignation ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm font-medium">
                            You have an active resignation request pending approval. Please wait for HR to process it.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Intended Last Working Day</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.intendedLastDay}
                                    onChange={e => setFormData({ ...formData, intendedLastDay: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                />
                                <p className="text-xs text-gray-400 mt-1">Typically 30-90 days notice period applies.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Reason for Leaving</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                                    placeholder="Please provide a brief reason..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/30 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Resignation'}
                            </button>
                        </form>
                    )}
                </div>

                {/* History */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Resignation History</h2>
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Loading...</div>
                    ) : resignations.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
                            No resignation records found.
                        </div>
                    ) : (
                        resignations.map(res => (
                            <div key={res._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group">
                                <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider
                                    ${res.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        res.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-100 text-gray-600'}`}>
                                    {res.status}
                                </div>
                                <h3 className="font-bold text-lg mb-1">Resignation Request</h3>
                                <p className="text-sm text-gray-500 mb-4">Submitted on {new Date(res.createdAt).toLocaleDateString()}</p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Last Day:</span>
                                        <span className="font-bold">{new Date(res.intendedLastDay).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Effective Notice:</span>
                                        <span className="font-bold">
                                            {Math.ceil((new Date(res.intendedLastDay).getTime() - new Date(res.createdAt).getTime()) / (1000 * 60 * 60 * 24))} Days
                                        </span>
                                    </div>
                                </div>
                                {res.managerComments && (
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Manager Comments</p>
                                        <p className="text-sm text-gray-700 mt-1">{res.managerComments}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
