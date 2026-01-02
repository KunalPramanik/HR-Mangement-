'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ManagerProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProjects(data);
                } else {
                    console.error('Failed to load projects', data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'At Risk': return 'bg-red-100 text-red-700';
            case 'Not Started': return 'bg-slate-100 text-slate-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Team Projects</h1>
                </div>
                <button onClick={() => router.push('/manager/projects/create')} className="size-8 rounded-full bg-[#135bec] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                    <span className="material-symbols-outlined text-lg">add</span>
                </button>
            </div>

            <div className="flex flex-col gap-6">
                {loading ? (
                    <div className="text-center py-10">Loading Projects...</div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-2">folder_open</span>
                        <p>No projects found. Create one!</p>
                    </div>
                ) : projects.map(project => (
                    <div key={project._id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between flex-wrap gap-2 mb-3">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{project.name}</h3>
                            <span className={`${getStatusColor(project.status)} text-xs font-bold px-2 py-1 rounded`}>{project.status}</span>
                        </div>

                        <div className="flex gap-4 text-xs text-slate-500 mb-4">
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                <span>Due {new Date(project.endDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">group</span>
                                <span>{project.teamMembers.length} Members</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">attach_money</span>
                                <span>${project.budget}</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Team</span>
                            </div>
                            <div className="flex -space-x-2 overflow-hidden">
                                {project.teamMembers.slice(0, 5).map((member: any, i: number) => (
                                    <div key={i} className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-slate-800 bg-slate-200 flex items-center justify-center text-xs font-bold" title={`${member.firstName} ${member.lastName}`}>
                                        {member.firstName[0]}
                                    </div>
                                ))}
                                {project.teamMembers.length > 5 && (
                                    <div className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-slate-800 bg-slate-100 flex items-center justify-center text-xs font-bold">+{project.teamMembers.length - 5}</div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 rounded-lg">View Details</button>
                            <button className="flex-1 py-2 text-xs font-bold text-[#135bec] border border-[#135bec] rounded-lg">Manage</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
