'use client';

import { SessionProvider } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
    isDarkMode: false,
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export function Providers({ children }: { children: React.ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            if (newMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            return newMode;
        });
    };

    return (
        <SessionProvider>
            <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
                {children}
            </ThemeContext.Provider>
        </SessionProvider>
    );
}
