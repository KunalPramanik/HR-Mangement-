'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Review = {
    _id: string;
    cycleName: string;
    status: string;
    finalRating?: number;
    periodEnd: string;
};

export default function PerformanceReviewsPage() {
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch('/api/reviews');
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const activeReviews = reviews.filter(r => r.status !== 'Completed');
    const completedReviews = reviews.filter(r => r.status === 'Completed');

    // Helper for dummy scores if not present (since MVP doesn't have complex scoring yet)
    const getScore = (r: Review) => r.finalRating || '-';

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] mb-2">My Reviews</h1>
                    <p className="text-[#6b7280] font-medium">Track your performance and development goals.</p>
                </div>
                <button
                    onClick={() => router.push('/reviews/new')}
                    className="px-6 py-3 rounded-full bg-[#3b82f6] text-white font-bold shadow-lg hover:shadow-xl transition-all hover:bg-blue-600"
                >
                    New Review Cycle
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading reviews...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Active Reviews */}
                    {activeReviews.map(review => (
                        <div key={review._id} className="soft-card p-6 border-t-4 border-blue-500 relative group">
                            <div className="absolute top-4 right-4 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">{review.status}</div>
                            <h2 className="text-xl font-bold text-[#111827] mb-1">{review.cycleName}</h2>
                            <p className="text-sm text-gray-500 mb-6">Due {new Date(review.periodEnd).toLocaleDateString()}</p>

                            <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                                <div className={`h-2 rounded-full w-[35%] transition-all ${review.status === 'Manager Review' ? 'w-[70%] bg-purple-500' : 'bg-blue-500'}`}></div>
                            </div>

                            <button
                                onClick={() => router.push(`/reviews/${review._id}`)}
                                className="w-full py-3 rounded-lg bg-[#3b82f6] text-white font-bold text-sm shadow-md hover:bg-blue-600 transition-colors"
                            >
                                Continue Assessment
                            </button>
                        </div>
                    ))}

                    {/* Completed Reviews */}
                    {completedReviews.map(review => (
                        <div key={review._id} className="soft-card p-6 border-t-4 border-green-500 relative group">
                            <div className="absolute top-4 right-4 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Completed</div>
                            <h2 className="text-xl font-bold text-[#111827] mb-1">{review.cycleName}</h2>
                            <p className="text-sm text-gray-500 mb-6">Finished {new Date(review.periodEnd).toLocaleDateString()}</p>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 text-center border-r border-gray-100 last:border-0">
                                    <h4 className="text-2xl font-extrabold text-[#111827]">{getScore(review)}</h4>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Overall</p>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push(`/reviews/${review._id}`)}
                                className="w-full py-3 rounded-lg bg-gray-50 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-colors"
                            >
                                View Feedback
                            </button>
                        </div>
                    ))}

                    {reviews.length === 0 && (
                        <div className="col-span-3 text-center py-20 text-gray-400">
                            No reviews found. Start a new cycle!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
