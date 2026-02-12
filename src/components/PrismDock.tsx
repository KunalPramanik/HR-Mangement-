'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function PrismDock() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: 'dashboard' },
        { name: 'People', href: '/directory', icon: 'groups' },
        { name: 'Payroll', href: '/payroll', icon: 'payments' },
        { name: 'Calendar', href: '/calendar', icon: 'calendar_month' },
        { name: 'Tasks', href: '/tasks', icon: 'task' },
        { name: 'Insights', href: '/hr/reports', icon: 'analytics' },
    ];

    return (
        <>
            {/* Desktop Dock (Floating Top) - Hidden on Mobile */}
            <nav className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
                <div className="prism-dock px-6 py-3 flex items-center gap-8 bg-white/90 backdrop-blur-md border border-white/20 shadow-soft">

                    {/* Brand */}
                    <div className="flex items-center gap-2 pr-6 border-r border-gray-200">
                        <div className="size-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <span className="material-symbols-outlined text-[20px]">diamond</span>
                        </div>
                        <span className="font-extrabold text-lg text-[#111827] tracking-tight">MINDSTAR TECH</span>
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

                        <button
                            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                            className="size-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                            title="Sign Out"
                        >
                            <span className="material-symbols-outlined">logout</span>
                        </button>

                        <Link href="/profile">
                            <div className="size-10 rounded-full bg-blue-100 border-2 border-white shadow-sm overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 transition-all">
                                <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] font-bold">
                                    {session?.user?.name?.[0] || 'U'}
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation (Bottom Bar) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                <div className="flex justify-around items-center p-2 pb-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className="flex-1">
                                <div className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${isActive ? 'text-[#3b82f6] bg-blue-50' : 'text-gray-400'}`}>
                                    <span className={`material-symbols-outlined text-[24px] ${isActive ? 'filled' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-[10px] font-bold mt-1">{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                    <Link href="/profile" className="flex-1">
                        <div className={`flex flex-col items-center justify-center p-2 rounded-xl text-gray-400`}>
                            <span className="material-symbols-outlined text-[24px]">person</span>
                            <span className="text-[10px] font-bold mt-1">Profile</span>
                        </div>
                    </Link>
                </div>
            </nav>

            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <span className="material-symbols-outlined text-[20px]">diamond</span>
                    </div>
                    <span className="font-extrabold text-lg text-[#111827] tracking-tight">MINDSTAR TECH</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button
                        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                        className="size-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}
