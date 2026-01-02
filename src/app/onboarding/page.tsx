'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OnboardingPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Complete Employee Profile', completed: true },
        { id: 2, title: 'Upload ID Documents', completed: true },
        { id: 3, title: 'Sign Policy Agreements', completed: false },
        { id: 4, title: 'Set up Direct Deposit', completed: false },
        { id: 5, title: 'IT Setup & Access', completed: false },
    ]);

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Onboarding</h1>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 flex flex-col items-center">
                <div className="relative size-32 mb-4">
                    <svg className="size-full" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#135bec" strokeWidth="3" strokeDasharray={`${progress}, 100`} className="animate-[spin_1s_ease-out_reverse]" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold text-[#135bec]">{progress}%</span>
                        <span className="text-xs text-slate-500">Completed</span>
                    </div>
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white text-lg">Welcome Aboard!</h2>
                <p className="text-center text-slate-500 text-sm mt-1">Please complete the following tasks to finish your setup.</p>
            </div>

            <div className="flex flex-col gap-3">
                {tasks.map(task => (
                    <div key={task.id} onClick={() => toggleTask(task.id)} className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${task.completed ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/50' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                        <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                            {task.completed && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                        </div>
                        <span className={`font-medium ${task.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{task.title}</span>
                    </div>
                ))}
            </div>

            <button disabled={progress < 100} onClick={() => alert('Onboarding submitted!')} className="w-full mt-6 bg-[#135bec] text-white font-bold p-4 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Complete Onboarding
            </button>
        </div>
    );
}
