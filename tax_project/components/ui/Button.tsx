import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    {
                        "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200": variant === "default",
                        "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900": variant === "outline",
                        "hover:bg-slate-100 text-slate-900": variant === "ghost",
                        "text-blue-600 underline-offset-4 hover:underline": variant === "link",
                        "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-200": variant === "destructive",
                        "bg-slate-100 text-slate-900 hover:bg-slate-200": variant === "secondary",
                        "h-10 px-4 py-2": size === "default",
                        "h-9 rounded-md px-3": size === "sm",
                        "h-12 rounded-lg px-8 text-lg": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
