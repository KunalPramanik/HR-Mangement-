'use client';

import { useRouter } from 'next/navigation';

export default function BenefitsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Benefits</h1>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <span className="material-symbols-outlined text-4xl">medical_services</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                    </div>
                    <h3 className="text-lg font-bold">Health Insurance Premium</h3>
                    <p className="text-blue-100 text-sm mb-4">Coverage for Family & Spouse</p>
                    <button onClick={() => alert('Viewing Policy Details')} className="bg-white text-blue-600 font-bold text-sm px-4 py-2 rounded-lg">View Details</button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <span className="material-symbols-outlined">fitness_center</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Gym Membership</h3>
                            <p className="text-xs text-slate-500">Reimbursement up to $50/mo</p>
                        </div>
                    </div>
                    <button onClick={() => alert('Claim Request Started')} className="text-[#135bec] font-bold text-xs border border-[#135bec] px-3 py-1.5 rounded-lg">Claim</button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <span className="material-symbols-outlined">savings</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">401(k) Plan</h3>
                            <p className="text-xs text-slate-500">5% Employer Match</p>
                        </div>
                    </div>
                    <button onClick={() => alert('Opening Portal')} className="text-slate-400 font-bold text-xs"><span className="material-symbols-outlined">open_in_new</span></button>
                </div>
            </div>
        </div>
    );
}
