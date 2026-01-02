'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PoliciesPage() {
    const router = useRouter();
    const [policies, setPolicies] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/policies')
            .then(res => res.json())
            .then(data => setPolicies(data));
    }, []);

    const categories = Array.from(new Set(policies.map(p => p.category)));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Company Policies</h1>
                    <p className="text-slate-500">Guidelines and compliance documents.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {categories.map(cat => (
                    <div key={cat}>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">{cat}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {policies.filter(p => p.category === cat).map(policy => (
                                <div key={policy._id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg group-hover:bg-[#135bec] group-hover:text-white transition-colors">
                                            <span className="material-symbols-outlined">article</span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{policy.title}</h3>
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-3">{policy.content}</p>
                                    <div className="mt-4 flex justify-end">
                                        <button className="text-xs font-bold text-[#135bec] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            Read Policy <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {policies.length === 0 && (
                    <div className="p-10 text-center text-slate-500">No policies found.</div>
                )}
            </div>
        </div>
    );
}
