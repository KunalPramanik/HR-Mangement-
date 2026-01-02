'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ConductReviewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [review, setReview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        rating: '',
        feedback: '',
        goals: '',
        status: ''
    });

    useEffect(() => {
        if (id) fetchReview();
    }, [id]);

    const fetchReview = async () => {
        try {
            const res = await fetch(`/api/performance/${id}`);
            if (res.ok) {
                const data = await res.json();
                setReview(data);
                setFormData({
                    rating: data.rating || 'Meets Expectations',
                    feedback: data.feedback || '',
                    goals: data.goals || '',
                    status: data.status || 'Pending'
                });
            } else {
                alert('Review not found');
                router.back();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/performance/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Review saved successfully');
                router.back();
            } else {
                alert('Failed to save review');
            }
        } catch (error) {
            alert('Error saving review');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading review...</div>;
    if (!review) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Conduct/Edit Review</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{review.userId?.firstName} {review.userId?.lastName}</h2>
                    <p className="text-slate-500">{review.userId?.role} • {review.userId?.department}</p>
                    <p className="text-xs text-slate-400 mt-1">Cycle: {review.cycle}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Overall Rating</label>
                        <select
                            className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={formData.rating}
                            onChange={e => setFormData({ ...formData, rating: e.target.value })}
                        >
                            <option>Exceptional</option>
                            <option>Exceeds Expectations</option>
                            <option>Meets Expectations</option>
                            <option>Needs Improvement</option>
                            <option>Unsatisfactory</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Detailed Feedback</label>
                        <textarea
                            rows={5}
                            className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            placeholder="Provide detailed feedback on performance..."
                            value={formData.feedback}
                            onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Goals for Next Cycle</label>
                        <textarea
                            rows={3}
                            className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            placeholder="Set goals..."
                            value={formData.goals}
                            onChange={e => setFormData({ ...formData, goals: e.target.value })}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Review Status</label>
                        <select
                            className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[#135bec] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
