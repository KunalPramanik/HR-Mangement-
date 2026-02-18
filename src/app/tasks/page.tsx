'use client';

import { useState, useEffect } from 'react';

type Task = {
    _id: string; // MongoDB ID
    title: string;
    due: string; // ISO Display String
    status: 'Pending' | 'In Progress' | 'Completed';
    type: string;
    priority: 'High' | 'Medium' | 'Low';
    completed?: boolean;
};

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks');
            if (res.ok) {
                const data = await res.json();
                // Map API data to view model
                setTasks(data.map((t: any) => ({
                    ...t,
                    due: new Date(t.dueDate).toLocaleDateString(),
                    completed: t.status === 'Completed'
                })));
            }
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState<{ title: string; due: string; priority: 'High' | 'Medium' | 'Low'; type: string }>({ title: '', due: '', priority: 'Medium', type: '' });

    const toggleTask = async (id: string) => {
        const task = tasks.find(t => t._id === id);
        if (!task) return;

        const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';

        // Optimistic UI Update
        const originalTasks = [...tasks];
        setTasks(tasks.map(t => t._id === id ? { ...t, status: newStatus, completed: newStatus === 'Completed' } : t));

        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Failed to update');
        } catch (error) {
            setTasks(originalTasks); // Revert
            alert('Failed to update task status');
        }
    };

    const handleOpenModal = (task?: Task) => {
        if (task) {
            setEditingTask(task);
            setFormData({ title: task.title, due: '', priority: task.priority, type: task.type });
        } else {
            setEditingTask(null);
            setFormData({ title: '', due: '', priority: 'Medium', type: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.due) return alert('Title and Due Date required');

        const body = {
            title: formData.title,
            dueDate: formData.due, // Input type='date' returns YYYY-MM-DD
            priority: formData.priority,
            type: formData.type
        };

        try {
            if (editingTask) {
                const res = await fetch(`/api/tasks/${editingTask._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (res.ok) fetchTasks();
            } else {
                const res = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (res.ok) fetchTasks();
            }
            setIsModalOpen(false);
        } catch (error) {
            alert('Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setTasks(tasks.filter(t => t._id !== id));
                }
            } catch (error) {
                alert('Failed to delete');
            }
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">My Tasks</h1>
                    <p className="text-[#6b7280] font-medium">Manage your daily priorities.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-3 rounded-full bg-[#3b82f6] text-white font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:bg-[#2563eb] transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    New Task
                </button>
            </div>

            {/* Task List */}
            <div className="soft-card p-8">
                <div className="space-y-4">
                    {loading ? <p className="text-center py-10 text-gray-500">Loading tasks...</p> :
                        tasks.length === 0 ? <p className="text-gray-500 text-center py-10">No tasks found. Create one to get started!</p> : tasks.map((task) => (
                            <div key={task._id} className={`flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors group ${task.completed ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => toggleTask(task._id)}
                                        className={`size-6 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                                    >
                                        {task.completed && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                                    </button>
                                    <div>
                                        <h3 className={`font-bold text-[#111827] ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</h3>
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-1">
                                            <span className={`px-2 py-0.5 rounded-md ${task.priority === 'High' ? 'bg-red-100 text-red-600' :
                                                task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                                                }`}>{task.priority}</span>
                                            <span>• Due {task.due}</span>
                                            <span>• {task.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(task)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                        title="Edit"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                        title="Delete"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-scaleUp">
                        <h2 className="text-2xl font-extrabold text-[#111827] mb-6">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    placeholder="e.g. Finish Monthly Report"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.due}
                                        onChange={e => setFormData({ ...formData, due: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                                    <input
                                        type="text"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        placeholder="e.g. Design"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                                <div className="flex gap-2">
                                    {['High', 'Medium', 'Low'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setFormData({ ...formData, priority: p as any })}
                                            className={`flex-1 py-2 rounded-lg font-bold text-sm border-2 transition-all ${formData.priority === p ?
                                                (p === 'High' ? 'border-red-500 bg-red-50 text-red-600' : p === 'Medium' ? 'border-yellow-500 bg-yellow-50 text-yellow-600' : 'border-green-500 bg-green-50 text-green-600')
                                                : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 rounded-xl bg-[#3b82f6] text-white font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {editingTask ? 'Save Changes' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
