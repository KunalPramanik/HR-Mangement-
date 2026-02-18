'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

export default function PrismDock() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);
    const navScrollRef = useRef<HTMLDivElement>(null);

    const role = session?.user?.role;

    // Define Role Groups
    const isAdmin = ['admin', 'director', 'cho', 'cxo', 'vp', 'hr'].includes(role || '');
    const isManager = ['manager'].includes(role || '');

    // Dynamic Navigation Items
    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: 'dashboard', show: true },
        { name: 'People', href: '/directory', icon: 'groups', show: true },
        { name: 'Recruit', href: '/recruitment', icon: 'person_search', show: isAdmin },
        { name: 'Onboard', href: '/admin/onboarding', icon: 'badge', show: isAdmin },
        { name: 'Assets', href: '/admin/assets', icon: 'devices', show: isAdmin },
        { name: 'Training', href: '/admin/training', icon: 'school', show: true },
        {
            name: isAdmin ? 'Payroll' : 'Payslips',
            href: isAdmin ? '/payroll' : '/payslips',
            icon: 'payments',
            show: true
        },
        { name: 'Expenses', href: '/admin/expenses', icon: 'receipt_long', show: true },
        { name: 'Timesheets', href: '/timesheets', icon: 'timer', show: true },
        { name: 'Calendar', href: '/calendar', icon: 'calendar_month', show: true },
        { name: 'Tasks', href: '/tasks', icon: 'task', show: true },
        { name: 'Analytics', href: '/admin/analytics', icon: 'analytics', show: isAdmin },
    ].filter(item => item.show);

    // Check scroll position for desktop navigation
    const checkScroll = () => {
        if (navScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = navScrollRef.current;
            setShowLeftScroll(scrollLeft > 10);
            setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const navElement = navScrollRef.current;
        if (navElement) {
            checkScroll();
            navElement.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                navElement.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [navItems]);

    const scrollNav = (direction: 'left' | 'right') => {
        if (navScrollRef.current) {
            const scrollAmount = 200;
            navScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <>
            {/* Desktop Dock (Floating Top) */}
            <nav className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[95vw] max-w-[1400px]">
                <div className="prism-dock px-4 py-3 flex items-center gap-4 bg-white/90 backdrop-blur-md border border-white/20 shadow-soft rounded-full relative w-full">
                    {/* Brand */}
                    <div className="flex items-center gap-2 pr-4 border-r border-gray-200 shrink-0">
                        <div className="size-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <span className="material-symbols-outlined text-[20px]">diamond</span>
                        </div>
                        <span className="font-extrabold text-lg text-[#111827] tracking-tight">MINDSTAR</span>
                    </div>

                    {/* Navigation with Scroll Indicators */}
                    <div className="relative flex items-center flex-1 min-w-0">
                        {/* Left Scroll Indicator */}
                        {showLeftScroll && (
                            <button
                                onClick={() => scrollNav('left')}
                                className="absolute left-0 z-10 size-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all -translate-x-4"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                        )}

                        {/* Scrollable Navigation */}
                        <div
                            ref={navScrollRef}
                            className="flex items-center gap-2 overflow-x-auto scroll-smooth w-full"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <div className={`
                                            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-bold text-sm select-none whitespace-nowrap
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

                        {/* Right Scroll Indicator */}
                        {showRightScroll && (
                            <button
                                onClick={() => scrollNav('right')}
                                className="absolute right-0 z-10 size-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all translate-x-4"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        )}
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200 shrink-0">
                        <Link href="/admin/notifications">
                            <button className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                        </Link>

                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="size-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors shrink-0"
                            title="Sign Out"
                        >
                            <span className="material-symbols-outlined">logout</span>
                        </button>

                        <Link href="/profile">
                            <div className="size-10 rounded-full bg-blue-100 border-2 border-white shadow-sm overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 transition-all shrink-0">
                                <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] font-bold">
                                    {session?.user?.name?.[0] || 'U'}
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Mobile Top Bar with Hamburger Menu */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <span className="material-symbols-outlined text-[20px]">diamond</span>
                    </div>
                    <span className="font-extrabold text-lg text-[#111827] tracking-tight">MINDSTAR</span>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/notifications">
                        <button className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 active:bg-gray-200 transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="size-10 rounded-full bg-blue-50 text-[#3b82f6] flex items-center justify-center active:bg-blue-100 transition-colors"
                        aria-label="Menu"
                    >
                        <span className="material-symbols-outlined">
                            {mobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="md:hidden fixed top-[65px] right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl overflow-y-auto animate-slide-in">
                        <div className="p-4 space-y-2">
                            {/* User Profile Section */}
                            <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 mb-4">
                                    <div className="size-12 rounded-full bg-[#3b82f6] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {session?.user?.name?.[0] || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{session?.user?.name || 'User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Navigation Items */}
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <div className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                            ${isActive
                                                ? 'bg-blue-50 text-[#3b82f6] shadow-sm'
                                                : 'text-gray-600 active:bg-gray-50'}
                                        `}>
                                            <span className={`material-symbols-outlined text-[24px] ${isActive ? 'filled' : ''}`}>
                                                {item.icon}
                                            </span>
                                            <span className="font-semibold">{item.name}</span>
                                        </div>
                                    </Link>
                                );
                            })}

                            {/* Divider */}
                            <div className="h-px bg-gray-200 my-4" />

                            {/* Logout Button */}
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    signOut({ callbackUrl: '/login' });
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 active:bg-red-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[24px]">logout</span>
                                <span className="font-semibold">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                <div className="flex justify-around items-center px-2 py-2 pb-4">
                    {navItems.slice(0, 4).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className="flex-1 min-w-0">
                                <div className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${isActive ? 'text-[#3b82f6] bg-blue-50' : 'text-gray-400 active:bg-gray-50'}`}>
                                    <span className={`material-symbols-outlined text-[24px] ${isActive ? 'filled' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-[10px] font-bold mt-1 truncate w-full text-center px-1">{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex-1 min-w-0"
                    >
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-400 active:bg-gray-50 transition-colors">
                            <span className="material-symbols-outlined text-[24px]">menu</span>
                            <span className="text-[10px] font-bold mt-1">More</span>
                        </div>
                    </button>
                </div>
            </nav>
        </>
    );
}
