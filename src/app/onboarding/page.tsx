'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [onboardingState, setOnboardingState] = useState<any>(null);
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Complete Employee Profile', completed: false },
        { id: 2, title: 'Upload ID Documents', completed: false },
        { id: 3, title: 'Set up Direct Deposit', completed: false },
        { id: 4, title: 'IT Asset Setup', completed: false },
        { id: 5, title: 'Sign Policy Agreements', completed: false },
    ]);

    useEffect(() => {
        fetchOnboardingStatus();
    }, []);

    const fetchOnboardingStatus = async () => {
        try {
            const res = await fetch('/api/onboarding');
            if (res.ok) {
                const data = await res.json();
                setOnboardingState(data);

                // Map currentStep to tasks
                // If currentStep is 3, then 1 and 2 are done.
                const currentStep = data.currentStep || 1;
                setTasks(prev => prev.map(t => ({
                    ...t,
                    completed: t.id < currentStep
                })));
            }
        } catch (error) {
            console.error('Failed to fetch onboarding status', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteStep = async (stepId: number) => {
        // Only allow completing the current step
        const currentStep = onboardingState?.currentStep || 1;
        if (stepId !== currentStep) return;

        try {
            const res = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentStep: stepId + 1,
                    status: stepId === 5 ? 'Submitted' : 'In Progress'
                })
            });

            if (res.ok) {
                await fetchOnboardingStatus(); // Refresh
                if (stepId === 5) alert('Onboarding Completed!');
            }
        } catch (error) {
            alert('Failed to update progress');
        }
    };

    const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Onboarding Checklist</h1>
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
                {tasks.map(task => {
                    const currentStep = onboardingState?.currentStep || 1;
                    const isCurrent = task.id === currentStep;
                    const isLocked = task.id > currentStep;

                    return (
                        <div
                            key={task.id}
                            onClick={() => isCurrent && handleCompleteStep(task.id)}
                            className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${task.completed ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/50' :
                                isCurrent ? 'bg-blue-50 border-blue-200 cursor-pointer hover:shadow-md' :
                                    'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                                }`}
                        >
                            <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500 text-white' :
                                isCurrent ? 'border-blue-500 text-blue-500' :
                                    'border-slate-300'
                                }`}>
                                {task.completed ? <span className="material-symbols-outlined text-sm font-bold">check</span> : <span className="text-xs font-bold">{task.id}</span>}
                            </div>
                            <div className="flex-1">
                                <span className={`font-medium ${task.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{task.title}</span>
                                {isCurrent && <p className="text-xs text-blue-600 mt-1">Click to mark as complete</p>}
                            </div>
                            {isLocked && <span className="material-symbols-outlined text-gray-400 text-sm">lock</span>}
                        </div>
                    );
                })}
            </div>

            <button disabled={progress < 100} className="w-full mt-6 bg-[#135bec] text-white font-bold p-4 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {progress < 100 ? 'Complete All Steps First' : 'Onboarding Submitted'}
            </button>
        </div>
    );
}
