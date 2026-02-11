import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: string;
    error?: string;
    fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, icon, error, fullWidth = true, className = '', ...props }, ref) => {
        return (
            <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">
                        {label}
                    </label>
                )}

                <div className="relative group">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors duration-300">
                            <span className="material-symbols-outlined text-[20px]">{icon}</span>
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={`
              flex h-12 w-full rounded-xl bg-white/50 dark:bg-slate-800/50 
              border border-slate-200 dark:border-slate-700
              px-4 py-2 text-sm ring-offset-white 
              file:border-0 file:bg-transparent file:text-sm file:font-medium 
              placeholder:text-slate-400 
              text-slate-900 dark:text-white
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
              transition-all duration-300
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}
              ${className}
            `}
                        {...props}
                    />

                    {/* Subtle glow effect on focus */}
                    <div className="absolute inset-0 rounded-xl bg-[var(--primary)] opacity-0 group-focus-within:opacity-5 pointer-events-none transition-opacity duration-300" />
                </div>

                {error && (
                    <span className="text-xs text-red-500 font-medium ml-1 animate-slide-up">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
