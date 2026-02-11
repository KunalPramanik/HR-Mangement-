"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    IndianRupee,
    Home,
    TrendingUp,
    FileText,
    Scale,
    LogOut,
    Receipt,
    Landmark
} from "lucide-react"

export function SideNav() {
    const pathname = usePathname()

    const links = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },

        { type: "header", label: "Employee Management" },
        { href: "/payroll/employees", label: "Employee Master", icon: FileText },
        { href: "/payroll/employees/add", label: "Onboard Employee", icon: TrendingUp },

        { type: "header", label: "Payroll Lifecycle" },
        { href: "/payroll", label: "Processing Hub", icon: IndianRupee },
        { href: "/payroll/history", label: "Past Cycles", icon: Receipt },

        { type: "header", label: "Compliance & Tax" },
        { href: "/compliance/it-regimes", label: "Tax Regimes", icon: Scale },
        { href: "/compliance/professional-tax", label: "PT Slabs (State)", icon: Landmark },
        { href: "/compliance/form-16", label: "Form-16 Master", icon: FileText },

        { type: "header", label: "System Admin" },
        { href: "/setup", label: "Organization Setup", icon: LayoutDashboard },
        { href: "/admin/audit-logs", label: "Audit Trails", icon: FileText },
    ]

    return (
        <nav className="flex-1 p-4 space-y-1">
            {links.map((link, i) => {
                if (link.type === "header") {
                    return (
                        <div key={i} className="pt-4 pb-2 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {link.label}
                        </div>
                    )
                }

                const Icon = link.icon!
                const isActive = pathname === link.href

                return (
                    <Link
                        key={link.href}
                        href={link.href!}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                            isActive
                                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        {link.label}
                    </Link>
                )
            })}
        </nav>
    )
}
