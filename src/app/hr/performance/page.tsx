'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Review {
    _id: string;
    userId: { firstName: string; lastName: string; role: string } | null;
    rating: string;
    status: string;
    cycle: string;
    updatedAt: string;
}

export default function PerformanceReviewsPage() {
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [startingCycle, setStartingCycle] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/performance');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setReviews(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewCycle = async () => {
        if (!confirm('Start a new Performance Review cycle for all employees?')) return;

        setStartingCycle(true);
        try {
            const res = await fetch('/api/performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start-cycle' })
            });

            if (res.ok) {
                alert('New cycle started successfully!');
                fetchReviews();
            } else {
                alert('Failed to start cycle');
            }
        } catch (error) {
            alert('Error starting cycle');
        } finally {
            setStartingCycle(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Performance Reviews</h1>
                </div>
                <button
                    onClick={handleNewCycle}
                    disabled={startingCycle}
                    className="bg-[#135bec] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50"
                >
                    {startingCycle ? 'Starting...' : 'New Cycle'}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2">reviews</span>
                    <p>No performance reviews found.</p>
                    <p className="text-sm">Click "New Cycle" to start.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {reviews.map((review) => {
                        const userName = review.userId ? `${review.userId.firstName} ${review.userId.lastName}` : 'Unknown User';
                        const userRole = review.userId?.role || 'N/A';

                        return (
                            <div key={review._id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{userName}</h3>
                                        <p className="text-xs text-slate-500">{userRole}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${review.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>{review.status}</span>
                                </div>

                                <div className="my-3 flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                                    <span className="text-slate-500">Current Rating</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{review.rating || 'N/A'}</span>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs text-slate-400">{review.cycle} • {format(new Date(review.updatedAt), 'MMM d')}</span>
                                    <button onClick={() => router.push(`/hr/performance/${review._id}`)} className="text-[#135bec] text-xs font-bold border border-[#135bec] px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                        {review.status === 'Completed' ? 'View Report' : 'Conduct Review'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
