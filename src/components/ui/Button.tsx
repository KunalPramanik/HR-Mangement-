import React, { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    // Base Classes
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-in-out border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    // Variants
    const variants: Record<ButtonVariant, string> = {
        primary: 'bg-[#135bec] hover:bg-blue-700 text-white border-transparent focus:ring-blue-500 shadow-lg shadow-blue-500/30',
        secondary: 'bg-slate-800 hover:bg-slate-700 text-white border-transparent focus:ring-slate-500',
        outline: 'bg-transparent border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800',
        ghost: 'bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50',
        danger: 'bg-red-500 hover:bg-red-600 text-white border-transparent focus:ring-red-500 shadow-lg shadow-red-500/30',
        success: 'bg-green-500 hover:bg-green-600 text-white border-transparent focus:ring-green-500 shadow-lg shadow-green-500/30',
    };

    // Sizes
    const sizes: Record<ButtonSize, string> = {
        sm: 'text-xs px-3 py-1.5 gap-1.5',
        md: 'text-sm px-5 py-2.5 gap-2',
        lg: 'text-base px-6 py-3 gap-2.5',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!isLoading && leftIcon}
            {children}
            {!isLoading && rightIcon}
        </button>
    );
};

export default Button;
