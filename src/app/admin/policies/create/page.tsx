'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddPolicyPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ title: '', category: 'General', content: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/policies', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        if (res.ok) router.push('/policies');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex justify-center">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8">
                <h1 className="text-2xl font-bold mb-6 dark:text-white">Create New Policy</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-white">Title</label>
                        <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-white">Category</label>
                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white">
                            <option>General</option>
                            <option>Leave</option>
                            <option>Conduct</option>
                            <option>IT & Security</option>
                            <option>Benefits</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-white">Content</label>
                        <textarea required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full p-2 border rounded h-40 dark:bg-slate-700 dark:text-white" placeholder="Policy details..." />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">Publish Policy</button>
                </form>
            </div>
        </div>
    );
}
