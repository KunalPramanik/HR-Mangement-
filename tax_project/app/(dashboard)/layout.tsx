import Link from "next/link"
import { LogOut } from "lucide-react"
import { SideNav } from "@/components/SideNav"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed inset-y-0 z-50">
                <div className="p-6 border-b border-slate-100">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-slate-900">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                            TS
                        </div>
                        TaxStitch
                    </Link>
                </div>

                <SideNav />

                <div className="p-4 border-t border-slate-100">
                    <Link href="/login" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
