'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateAnnouncementPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState('medium');
    const [audience, setAudience] = useState('all');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    priority,
                    targetAudience: audience,
                    category: 'general' // Default
                })
            });

            if (res.ok) {
                alert('Announcement Published Successfully!');
                router.back();
            } else {
                const err = await res.json();
                alert('Error: ' + err.error);
            }
        } catch (error) {
            alert('Failed to publish');
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
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">New Announcement</h1>
            </div>

            <form className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-4" onSubmit={handleSubmit}>
                <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</span>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                        placeholder="e.g. Office Closure"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Content</span>
                    <textarea
                        required
                        rows={4}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                        placeholder="Details..."
                    ></textarea>
                </label>

                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</span>
                        <select
                            value={priority}
                            onChange={e => setPriority(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                        >
                            <option value="medium">Normal</option>
                            <option value="high">High</option>
                            <option value="low">Low</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Audience</span>
                        <select
                            value={audience}
                            onChange={e => setAudience(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                        >
                            <option value="all">All Employees</option>
                            <option value="employees">Employees Only</option>
                            <option value="managers">Managers</option>
                            <option value="hr">HR Only</option>
                        </select>
                    </label>
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id="email" className="rounded border-slate-300 text-[#135bec] focus:ring-[#135bec]" />
                    <label htmlFor="email" className="text-sm text-slate-600 dark:text-slate-400">Send via Email (Simulated)</label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full bg-[#135bec] text-white font-bold p-4 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Publishing...' : 'Publish Announcement'}
                </button>
            </form>
        </div>
    );
}
