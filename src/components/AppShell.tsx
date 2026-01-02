'use client';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublic = pathname === '/login' || pathname === '/' || pathname === '/forgot-password';

    if (isPublic) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark">
            <Sidebar />
            <main className="flex-1 md:ml-64 w-full min-h-screen relative">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
