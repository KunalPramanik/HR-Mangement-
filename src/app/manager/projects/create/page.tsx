'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CreateProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);

    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState(0);
    const [status, setStatus] = useState('Not Started');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    useEffect(() => {
        // Fetch employees for selection
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setUsers(data);
            })
            .catch(err => console.error(err));
    }, []);

    const toggleMember = (id: string) => {
        if (selectedMembers.includes(id)) {
            setSelectedMembers(selectedMembers.filter(m => m !== id));
        } else {
            setSelectedMembers([...selectedMembers, id]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    startDate,
                    endDate,
                    budget,
                    status,
                    teamMembers: selectedMembers
                })
            });

            if (res.ok) {
                alert('Project Created Successfully!');
                router.push('/manager/projects');
            } else {
                const err = await res.json();
                alert('Error: ' + err.error);
            }
        } catch (error) {
            alert('Failed to create project');
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl mx-auto">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="grid grid-cols-1 gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Project Name <span className="text-red-500">*</span></span>
                            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5" placeholder="e.g. Q1 Marketing Campaign" />
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</span>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"></textarea>
                        </label>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Date <span className="text-red-500">*</span></span>
                                <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5" />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">End Date <span className="text-red-500">*</span></span>
                                <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5" />
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Budget ($)</span>
                                <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5" placeholder="5000" />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</span>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5">
                                    <option>Not Started</option>
                                    <option>In Progress</option>
                                    <option>On Hold</option>
                                    <option>Completed</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Team Members</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {users.map(user => (
                            <div
                                key={user._id}
                                onClick={() => toggleMember(user._id)}
                                className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${selectedMembers.includes(user._id)
                                        ? 'bg-blue-50 border-[#135bec] dark:bg-blue-900/20'
                                        : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${selectedMembers.includes(user._id) ? 'bg-[#135bec] text-white' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {user.firstName[0]}{user.lastName[0] || ''}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs text-slate-500">{user.position || user.role}</p>
                                </div>
                                {selectedMembers.includes(user._id) && (
                                    <span className="material-symbols-outlined text-[#135bec] ml-auto">check_circle</span>
                                )}
                            </div>
                        ))}
                        {users.length === 0 && <p className="text-sm text-slate-500">No users found.</p>}
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-[#135bec] text-white font-bold p-4 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors disabled:opacity-70">
                    {loading ? 'Creating...' : 'Create Project'}
                </button>
            </form>
        </div>
    );
}
