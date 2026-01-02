'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function MyProjectsPage() {
    const router = useRouter();

    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error(error);
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
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Projects</h1>
                </div>
                <button
                    onClick={() => router.push('/projects/create')}
                    className="bg-[#135bec] text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 flex items-center gap-1"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>New Project</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading Projects...</div>
            ) : projects.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2">folder_off</span>
                    <p>No projects found.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {projects.map((project: any) => {
                        const completedTasks = project.tasks?.filter((t: any) => t.status === 'Done').length || 0;
                        const totalTasks = project.tasks?.length || 0;
                        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                        return (
                            <div key={project._id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{project.name}</h3>
                                        <p className="text-xs text-slate-500">Manager: {project.managerId?.firstName} {project.managerId?.lastName}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                        project.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>{project.status}</span>
                                </div>

                                <div className="flex justify-between text-xs text-slate-400 mt-2 mb-1">
                                    <span>Deadline: {new Date(project.endDate).toLocaleDateString()}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-4">
                                    <div
                                        className={`h-2 rounded-full ${project.status === 'In Progress' ? 'bg-[#135bec]' : 'bg-orange-400'}`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>

                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={() => router.push(`/projects/${project._id}`)}
                                        className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        View Details / Tasks
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
