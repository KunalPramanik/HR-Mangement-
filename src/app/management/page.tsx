'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function ManagementPage() {
    const { data: session } = useSession();
    const isAdmin = ['admin', 'hr', 'director', 'manager'].includes(session?.user?.role || '');

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="bg-red-50 text-red-600 size-20 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl">gpp_bad</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Restricted</h1>
                <p className="text-slate-500 mb-8 max-w-md">You do not have permission to view management tools.</p>
                <Link href="/dashboard" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    const tools = [
        { name: 'Directory', href: '/directory', icon: 'groups', desc: 'Staff Database', color: 'text-blue-600 bg-blue-50' },
        { name: 'Recruitment', href: '/recruitment', icon: 'person_search', desc: 'ATS Pipeline', color: 'text-purple-600 bg-purple-50' },
        { name: 'Onboarding', href: '/onboarding/new', icon: 'badge', desc: 'New Hires', color: 'text-green-600 bg-green-50' },
        { name: 'Assets', href: '/admin/assets', icon: 'devices', desc: 'Inventory', color: 'text-orange-600 bg-orange-50' },
        { name: 'Training', href: '/admin/training', icon: 'school', desc: 'L&D Programs', color: 'text-pink-600 bg-pink-50' },
        { name: 'Expenses', href: '/admin/expenses', icon: 'receipt_long', desc: 'Claims', color: 'text-yellow-600 bg-yellow-50' },
        { name: 'Timesheets', href: '/timesheets', icon: 'timer', desc: 'Approvals', color: 'text-cyan-600 bg-cyan-50' },
        { name: 'Analytics', href: '/admin/analytics', icon: 'analytics', desc: 'Reports', color: 'text-indigo-600 bg-indigo-50' },
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Management Console</h1>
            <p className="text-slate-500 mb-8">Access administrative tools and settings.</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {tools.map((tool) => (
                    <Link key={tool.name} href={tool.href} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:-translate-y-1 transition-all group">
                        <div className={`size-12 rounded-xl flex items-center justify-center mb-4 ${tool.color} group-hover:scale-110 transition-transform`}>
                            <span className="material-symbols-outlined text-[28px]">{tool.icon}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{tool.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{tool.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
