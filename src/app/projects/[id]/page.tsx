'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Task {
    _id: string; // Mongoose ID
    title: string;
    status: 'Pending' | 'In Progress' | 'Done';
    assignedTo?: { _id: string; firstName: string; lastName: string };
}

interface Project {
    _id: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    managerId: { firstName: string; lastName: string };
    tasks: Task[];
    progress: number; // calculated frontend or backend? Backend didn't send it, we solve it here.
}

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        if (id) fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProject(data);
            } else {
                alert('Project not found');
                router.push('/projects');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim() || !project) return;

        const updatedTasks = [...project.tasks, { _id: `temp-${Date.now()}`, title: newTask, status: 'Pending' } as Task]; // Optimistic

        try {
            // We update the whole project list of tasks or just push one. 
            // The API we wrote accepts PUT with body. 
            // We'll append the task to the existing list and send it.
            // Ideally backend handles $push, but simplified PUT works if we send all.
            // Actually, let's send just the new task if we built a specific endpoint, but we didn't.
            // So we send the updated task list.

            // Wait, we need to preserve IDs of existing tasks so they don't get recreated if Mongoose is smart, 
            // but Mongoose subdocuments arrays might replace if we send full array without _id.
            // Actually, we should preferably send the WHOLE project object or use a specific action.
            // Let's rely on standard PUT `req.body` overwriting `tasks`.

            const res = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tasks: [...project.tasks, { title: newTask, status: 'Pending' }]
                })
            });

            if (res.ok) {
                const updated = await res.json();
                setProject(updated);
                setNewTask('');
            }
        } catch (error) {
            alert('Failed to add task');
        }
    };

    const toggleTask = async (taskId: string, currentStatus: string) => {
        if (!project) return;
        const newStatus = currentStatus === 'Done' ? 'Pending' : 'Done';

        const updatedTasks = project.tasks.map(t =>
            (t._id === taskId || (t as any).id === taskId) ? { ...t, status: newStatus } : t
        ); // Handle optimistic update locally? 

        // Optimistic UI
        setProject({ ...project, tasks: updatedTasks as Task[] });

        try {
            await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasks: updatedTasks })
            });
            // Ideally re-fetch or use returned data to ensure sync
        } catch (error) {
            fetchProject(); // Revert on error
        }
    };

    // Calculate progress
    const calculateProgress = () => {
        if (!project || project.tasks.length === 0) return 0;
        const completed = project.tasks.filter(t => t.status === 'Done').length;
        return Math.round((completed / project.tasks.length) * 100);
    };

    if (loading) return <div className="text-center py-10">Loading Project...</div>;
    if (!project) return <div className="text-center py-10">Project not found</div>;

    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    const openEditModal = () => {
        if (!project) return;
        setEditFormData({
            name: project.name,
            description: project.description,
            status: project.status,
            startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
            endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''
        });
        setShowEditModal(true);
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData)
            });

            if (res.ok) {
                const updated = await res.json();
                setProject(updated);
                setShowEditModal(false);
            } else {
                alert('Failed to update project');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteProject = async () => {
        if (!confirm('Are you sure you want to DELETE this project? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('Project deleted successfully');
                router.push('/projects');
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to delete project');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Project Details</h1>
                </div>
                <button onClick={openEditModal} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"> Edit Details</button>
                <button onClick={handleDeleteProject} className="bg-red-50 dark:bg-red-900/20 text-red-600 px-3 py-1 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors ml-2">Delete</button>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{project.name}</h2>
                        <p className="text-slate-500">{project.managerId?.firstName ? `Manager: ${project.managerId.firstName} ${project.managerId.lastName}` : ''}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{project.status}</span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 mb-6">{project.description}</p>

                <div className="flex gap-6 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                        <span>Start: {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">event</span>
                        <span>End: {project.endDate ? format(new Date(project.endDate), 'MMM d, yyyy') : 'N/A'}</span>
                    </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-2">
                    <div className="bg-[#135bec] h-3 rounded-full transition-all duration-500" style={{ width: `${calculateProgress()}%` }}></div>
                </div>
                <p className="text-right text-xs text-slate-500">{calculateProgress()}% Complete</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tasks</h3>

                <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="Add a new task..."
                        className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                    />
                    <button type="submit" className="bg-[#135bec] text-white px-4 rounded-lg font-bold hover:bg-blue-700">Add</button>
                </form>

                <div className="flex flex-col gap-3">
                    {project.tasks.map((task: any) => (
                        <div key={task._id || task.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg group">
                            <button
                                onClick={() => toggleTask(task._id || task.id, task.status)}
                                className={`size-5 rounded border flex items-center justify-center transition-colors ${task.status === 'Done' ? 'bg-green-500 border-green-500' : 'border-slate-400 hover:border-[#135bec]'}`}
                            >
                                {task.status === 'Done' && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
                            </button>
                            <span className={`flex-1 ${task.status === 'Done' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                {task.title}
                            </span>
                            <button className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-1 rounded transition-opacity">
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    ))}
                    {project.tasks.length === 0 && <p className="text-center text-slate-400 text-sm">No tasks yet.</p>}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-xl animate-scale-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Project</h3>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProject} className="flex flex-col gap-4">
                            <label className="block">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Project Name</span>
                                <input type="text" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full p-2 border rounded-lg mt-1" required />
                            </label>
                            <label className="block">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</span>
                                <textarea value={editFormData.description} onChange={e => setEditFormData({ ...editFormData, description: e.target.value })} className="w-full p-2 border rounded-lg mt-1 h-24"></textarea>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Status</span>
                                    <select value={editFormData.status} onChange={e => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full p-2 border rounded-lg mt-1">
                                        <option>Pending</option>
                                        <option>In Progress</option>
                                        <option>Completed</option>
                                        <option>On Hold</option>
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">End Date</span>
                                    <input type="date" value={editFormData.endDate} onChange={e => setEditFormData({ ...editFormData, endDate: e.target.value })} className="w-full p-2 border rounded-lg mt-1" />
                                </label>
                            </div>
                            <button type="submit" className="bg-[#135bec] text-white font-bold py-3 rounded-lg hover:bg-blue-700 mt-2">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
