'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role || '';

    // Define links based on role
    const links = [
        { name: 'Home', href: '/dashboard', icon: 'dashboard', roles: [] },
        { name: 'Profile', href: '/profile', icon: 'person', roles: [] },
        { name: 'Inbox', href: '/messages', icon: 'mail', roles: [] },
        // Management Links
        { name: 'Directory', href: '/directory', icon: 'groups', roles: [] },
        { name: 'Reports', href: '/hr/reports', icon: 'analytics', roles: ['director', 'cxo', 'cho', 'admin', 'hr'] },
        // General Links
        { name: 'Policies', href: '/policies', icon: 'policy', roles: [] },
        { name: 'Settings', href: '/settings', icon: 'settings', roles: [] },
    ];

    const visibleLinks = links.filter(link =>
        link.roles.length === 0 || link.roles.includes(role)
    );

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 bg-white dark:bg-[#101622] border-r border-slate-200 dark:border-slate-800 z-50">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-[#135bec] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                        M
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">Mindstar</h1>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">HR Portal</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Menu</div>
                {visibleLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                    return (
                        <Link key={link.href} href={link.href}>
                            <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group duration-200 ${isActive
                                ? 'bg-[#135bec]/10 text-[#135bec]'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`}>
                                <span className={`material-symbols-outlined text-[24px] transition-transform group-hover:scale-110 ${isActive ? 'filled' : ''}`}>
                                    {link.icon}
                                </span>
                                <span className={`text-sm font-bold ${isActive ? 'text-[#135bec]' : ''}`}>
                                    {link.name}
                                </span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#135bec] shadow-[0_0_8px_rgba(19,91,236,0.5)]"></div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <Link href="/profile">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 cursor-pointer group">
                        <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-600">
                            <span className="material-symbols-outlined text-slate-500 text-sm">person</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#135bec] transition-colors overflow-hidden text-ellipsis whitespace-nowrap w-32">
                                {session?.user?.name || 'My Account'}
                            </span>
                            <span className="text-[10px] text-slate-500">View Profile</span>
                        </div>
                    </div>
                </Link>
            </div>
        </aside>
    );
}
