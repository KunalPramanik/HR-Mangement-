import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

const GlassCard = ({ children, className = '', hoverEffect = false, ...props }: GlassCardProps) => {
    return (
        <div
            className={`
        relative overflow-hidden
        bg-white/70 dark:bg-slate-900/60 
        backdrop-blur-xl 
        border border-white/40 dark:border-white/10 
        shadow-xl dark:shadow-2xl 
        rounded-2xl
        transition-all duration-300 ease-out
        ${hoverEffect ? 'hover:shadow-2xl hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-slate-900/80' : ''}
        ${className}
      `}
            {...props}
        >
            {/* Dynamic Shine Effect */}
            <div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none" />

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default GlassCard;
