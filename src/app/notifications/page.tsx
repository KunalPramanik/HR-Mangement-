'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        try {
            await fetch('/api/notifications', { method: 'PUT' });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            alert('All marked as read');
        } catch (e) { console.error(e); }
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
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h1>
                </div>
                <button onClick={markAsRead} className="text-[#135bec] text-sm font-bold">Mark all read</button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#135bec]"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">notifications_off</span>
                    <p>No new notifications.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {notifications.map((notif) => (
                        <div key={notif._id} className={`p-4 rounded-xl shadow-sm border ${notif.read ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700' : 'bg-blue-50 dark:bg-slate-800 border-blue-100 dark:border-blue-900/50'}`}>
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-bold ${notif.read ? 'text-slate-900 dark:text-white' : 'text-[#135bec]'}`}>{notif.title}</h3>
                                <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{notif.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
