'use client';
import { usePathname } from 'next/navigation';
import PrismDock from './PrismDock';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublic = pathname === '/login' || pathname === '/' || pathname === '/forgot-password';

    if (isPublic) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen w-full bg-background-light relative">
            <PrismDock />
            <main className="w-full min-h-screen pt-28 md:pt-28 pb-24 md:pb-12 px-4 md:px-6 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}
