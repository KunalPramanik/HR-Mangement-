'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function PrismDock() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: 'dashboard' },
        { name: 'People', href: '/directory', icon: 'groups' },
        { name: 'Payroll', href: '/payroll', icon: 'payments' },
        { name: 'Insights', href: '/hr/reports', icon: 'analytics' },
    ];

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
            <div className="prism-dock px-6 py-3 flex items-center gap-8 bg-white/90 backdrop-blur-md border border-white/20">

                {/* Brand */}
                <div className="flex items-center gap-2 pr-6 border-r border-gray-200">
                    <div className="size-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <span className="material-symbols-outlined text-[20px]">diamond</span>
                    </div>
                    <span className="font-extrabold text-lg text-[#111827] tracking-tight">PRISMDOCK</span>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={`
                  flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-bold text-sm
                  ${isActive
                                        ? 'bg-blue-50 text-[#3b82f6] shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                `}>
                                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'filled' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span>{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* User Actions */}
                <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                    <button className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>

                    <Link href="/profile">
                        <div className="size-10 rounded-full bg-blue-100 border-2 border-white shadow-sm overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 transition-all">
                            {/* Placeholder Image or User Initial */}
                            <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] font-bold">
                                {session?.user?.name?.[0] || 'U'}
                            </div>
                        </div>
                    </Link>
                </div>

            </div>
        </nav>
    );
}
