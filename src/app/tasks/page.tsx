'use client';

import { useState } from 'react';

export default function TasksPage() {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Finalize UX Research', due: 'Today', status: 'Pending', type: 'Design', priority: 'High', completed: false },
        { id: 2, title: 'Update HR Documentation', due: 'Tomorrow', status: 'In Progress', type: 'Admin', priority: 'Medium', completed: false },
        { id: 3, title: 'Team Sync', due: 'Jan 20', status: 'Scheduled', type: 'Meeting', priority: 'Low', completed: true },
    ]);

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">My Tasks</h1>
                    <p className="text-[#6b7280] font-medium">Manage your daily priorities.</p>
                </div>
                <button className="px-6 py-3 rounded-full bg-[#3b82f6] text-white font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:bg-[#2563eb] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    New Task
                </button>
            </div>

            {/* Task List */}
            <div className="soft-card p-8">
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors group ${task.completed ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div
                                    onClick={() => toggleTask(task.id)}
                                    className={`size-6 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                                >
                                    {task.completed && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                                </div>
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
                            <button className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
