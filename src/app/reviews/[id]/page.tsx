'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function ReviewDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Use React.use() to unwrap params promise if necessary or standard hook pattern
    // Next.js 15+ changes params to Promise, but 14 and below is object. Assuming 14. 
    // If param access fails, I'll fix.

    // For now assume params is object or Promise.
    const [id, setId] = useState<string>('');

    // Unwrap params
    useEffect(() => {
        (async () => {
            const resolvedParams = await params;
            setId(resolvedParams.id);
        })();
    }, [params]);

    const [review, setReview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        achievements: '',
        areasOfImprovement: '',
        goals: ''
    });

    useEffect(() => {
        if (!id) return;
        const fetchReview = async () => {
            try {
                const res = await fetch(`/api/reviews/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReview(data);
                    // Pre-fill if exists
                    if (data.selfAssessment) {
                        setFormData({
                            achievements: data.selfAssessment.achievements || '',
                            areasOfImprovement: data.selfAssessment.areasOfImprovement || '',
                            goals: data.selfAssessment.goals || ''
                        });
                    }
                } else {
                    alert('Review not found'); // Or check permissions
                    router.push('/reviews');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchReview();
    }, [id, router]);

    const handleSave = async (submit: boolean = false) => {
        setSubmitting(true);
        try {
            const payload = {
                selfAssessment: formData,
                status: submit ? 'Submitted' : undefined // Only change status if submitting
            };

            const res = await fetch(`/api/reviews/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (submit) {
                    alert('Self-Assessment Submitted Successfully!');
                    router.push('/reviews');
                } else {
                    alert('Draft Saved');
                }
            } else {
                alert('Failed to save');
            }
        } catch (error) {
            alert('Error saving review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading review details...</div>;
    if (!review) return <div className="p-10 text-center text-gray-500">Review not found.</div>;

    const isReadOnly = review.status !== 'Self-Review';

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#111827]">{review.cycleName}</h1>
                    <p className="text-gray-500 font-medium">Self-Assessment Phase</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${review.status === 'Self-Review' ? 'bg-blue-100 text-blue-700' :
                        review.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {review.status}
                </div>
            </div>

            <div className="space-y-8">
                {/* Section 1 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-[#111827] mb-4">1. Key Achievements</h2>
                    <p className="text-sm text-gray-500 mb-4">Describe your major accomplishments in current period.</p>
                    <textarea
                        className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm disabled:opacity-50 disabled:bg-gray-50"
                        placeholder="I successfully delivered module X..."
                        value={formData.achievements}
                        onChange={e => setFormData({ ...formData, achievements: e.target.value })}
                        disabled={isReadOnly}
                    ></textarea>
                </div>

                {/* Section 2 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-[#111827] mb-4">2. Areas for Improvement</h2>
                    <p className="text-sm text-gray-500 mb-4">Where do you think you can improve?</p>
                    <textarea
                        className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm disabled:opacity-50 disabled:bg-gray-50"
                        placeholder="I would like to improve my..."
                        value={formData.areasOfImprovement}
                        onChange={e => setFormData({ ...formData, areasOfImprovement: e.target.value })}
                        disabled={isReadOnly}
                    ></textarea>
                </div>

                {/* Section 3 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-[#111827] mb-4">3. Goals for Next Period</h2>
                    <p className="text-sm text-gray-500 mb-4">Define measurable goals.</p>
                    <textarea
                        className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm disabled:opacity-50 disabled:bg-gray-50"
                        placeholder="1. Increase code coverage to 90%..."
                        value={formData.goals}
                        onChange={e => setFormData({ ...formData, goals: e.target.value })}
                        disabled={isReadOnly}
                    ></textarea>
                </div>

                {!isReadOnly && (
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => handleSave(false)}
                            disabled={submitting}
                            className="w-1/3 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={submitting}
                            className="w-2/3 py-4 rounded-xl bg-[#3b82f6] text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Assessment'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
