'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProjectPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'Not Started'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/projects');
                router.refresh();
            } else {
                alert('Failed to create project');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating project');
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
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Create New Project</h1>
            </div>

            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea
                            className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                            <input
                                type="date"
                                required
                                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                            <input
                                type="date"
                                required
                                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#135bec] text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </form>
            </div>
        </div>
    );
}
