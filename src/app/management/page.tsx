'use client';

import Link from 'next/link';

export default function ManagementPage() {
    const managementModules = [
        { name: 'Employee Directory', href: '/directory', icon: 'groups', color: 'bg-blue-500', desc: 'Manage staff profiles and roles' },
        { name: 'Leave Approvals', href: '/approvals/leaves', icon: 'approval_delegation', color: 'bg-purple-500', desc: 'Review and approve leave requests' },
        { name: 'Payroll Processing', href: '/payroll', icon: 'payments', color: 'bg-green-500', desc: 'Process salaries and generate slips' },
        { name: 'Performance Reviews', href: '/reviews', icon: 'rate_review', color: 'bg-orange-500', desc: 'Conduct employee evaluations' },
        { name: 'Recruitment', href: '/recruitment', icon: 'person_add', color: 'bg-pink-500', desc: 'Track applicants and interviews' },
        { name: 'Onboarding', href: '/onboarding/new', icon: 'badge', color: 'bg-teal-500', desc: 'Onboard new hires' },
        { name: 'Assets', href: '/assets', icon: 'devices', color: 'bg-indigo-500', desc: 'Track comprehensive inventory' },
        { name: 'Audit Logs', href: '/admin/audit-logs', icon: 'history', color: 'bg-gray-600', desc: 'System security trails' },
        { name: 'System Settings', href: '/settings', icon: 'settings', color: 'bg-slate-700', desc: 'Configure portal parameters' },
    ];

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">Management Console</h1>
                    <p className="text-[#6b7280] font-medium">Central control for administrative operations.</p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managementModules.map((mod, i) => (
                    <Link key={i} href={mod.href}>
                        <div className="group soft-card p-6 flex items-start gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer h-full">
                            <div className={`size-12 rounded-xl ${mod.color} text-white flex items-center justify-center shadow-lg`}>
                                <span className="material-symbols-outlined text-[24px]">{mod.icon}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-[#111827] group-hover:text-[#3b82f6] transition-colors">{mod.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{mod.desc}</p>
                            </div>
                            <div className="ml-auto">
                                <span className="material-symbols-outlined text-gray-300 group-hover:text-[#3b82f6] transition-colors">arrow_forward_ios</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
