'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
    const pathname = usePathname();

    const links = [
        { name: 'Home', href: '/dashboard', icon: 'dashboard' },
        { name: 'Profile', href: '/profile', icon: 'person' },
        { name: 'Inbox', href: '/messages', icon: 'mail' },
        { name: 'More', href: '/settings', icon: 'menu' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-[#101622] border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 px-2 z-50 transition-transform duration-300">
            <div className="flex justify-around items-end h-[60px] pb-3">
                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                    return (
                        <Link key={link.href} href={link.href}>
                            <div className={`flex flex-col items-center gap-1 w-16 group transition-colors ${isActive ? 'text-[#135bec]' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}>
                                <div className="relative">
                                    <span className={`material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform ${isActive ? 'filled' : ''}`}>
                                        {link.icon}
                                    </span>
                                    {link.name === 'Inbox' && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-[#101622]"></span>
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold ${isActive ? 'text-[#135bec]' : ''}`}>{link.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
