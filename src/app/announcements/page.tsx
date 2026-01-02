'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Announcement {
    _id: string;
    title: string;
    content: string;
    category: string;
    priority: string;
    publishedAt: string;
}

export default function AnnouncementsPage() {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await fetch('/api/announcements');
                if (res.ok) {
                    const data = await res.json();
                    setAnnouncements(data);
                }
            } catch (error) {
                console.error('Failed to fetch announcements', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'event': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'policy': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Announcements</h1>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#135bec]"></div>
                </div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">campaign</span>
                    <p>No announcements yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {announcements.map((item) => (
                        <div key={item._id} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide ${getCategoryColor(item.category)}`}>
                                    {item.category}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {item.publishedAt && format(new Date(item.publishedAt), 'MMM d, yyyy')}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                                {item.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {item.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
