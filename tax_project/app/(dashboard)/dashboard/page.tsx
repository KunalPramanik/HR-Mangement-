import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
import {
    Users,
    ArrowRight,
    Calendar,
    ShieldCheck,
    AlertCircle,
    FileCheck,
    History,
    TrendingUp
} from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Payroll Commander</h1>
                    <p className="text-slate-500">Authorized Operator Session: Active</p>
                </div>
                <Button asChild>
                    <Link href="/payroll">
                        Enter Processing Hub <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </Button>
            </div>

            {/* System Health / Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Active Employees" value="42" icon={Users} trend="Master Directory" />
                <StatsCard title="Monthly Net Payout" value="₹ 24,15,600" icon={Calendar} trend="Oct 2024 (Draft)" />
                <StatsCard title="Tax Compliance" value="100%" icon={ShieldCheck} trend="Audit Verified" />
                <StatsCard title="Pending Actions" value="3" icon={AlertCircle} trend="Requires Locking" color="text-amber-600" />
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Active Cycle Status */}
                <Card className="md:col-span-2 border-t-4 border-t-blue-600 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Current Payroll Cycle</CardTitle>
                                <CardDescription>October 2024 Processing</CardDescription>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                                Status: CALCULATED
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 border">
                                <span className="text-xs text-slate-500 uppercase font-semibold">Gross Salary</span>
                                <div className="text-xl font-bold text-slate-900">₹ 28,50,000</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border">
                                <span className="text-xs text-slate-500 uppercase font-semibold">Total TDS/Tax</span>
                                <div className="text-xl font-bold text-red-600">₹ 3,82,400</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="default" className="flex-1 shadow-md shadow-blue-200" asChild>
                                <Link href="/payroll">Continue Processing</Link>
                            </Button>
                            <Button variant="outline" className="flex-1" asChild>
                                <Link href="/payroll/history">View History</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Shortcuts */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Operator Actions</CardTitle>
                        <CardDescription>Shortcut to compliance tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <ShortcutLink icon={FileCheck} label="Onboard New Employee" href="/payroll/employees/add" />
                        <ShortcutLink icon={History} label="View Audit Trails" href="/admin/audit-logs" />
                        <ShortcutLink icon={ShieldCheck} label="Configure PT Slabs" href="/compliance/professional-tax" />
                        <ShortcutLink icon={TrendingUp} label="Tax Regime Analysis" href="/compliance/it-regimes" />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Audit Activity */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>System Audit Logs (Recent)</CardTitle>
                    <CardDescription>Immutable trace of global system actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <AuditItem time="10:30 AM" action="Payroll Calculated" entity="OCT_2024_CYCLE" user="SYSTEM_OPERATOR" status="SUCCESS" />
                        <AuditItem time="09:15 AM" action="Employee Master Created" entity="EMP0042 (John Doe)" user="SYSTEM_OPERATOR" status="SUCCESS" />
                        <AuditItem time="Yesterday" action="Organization Config Locked" entity="ORG_MASTER" user="SYSTEM_OPERATOR" status="SYSTEM" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, trend, color = "text-slate-900" }: any) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <p className="text-xs text-slate-400 mt-1">{trend}</p>
            </CardContent>
        </Card>
    )
}

function ShortcutLink({ icon: Icon, label, href }: any) {
    return (
        <Link href={href} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors group">
            <div className="p-2 rounded-md bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{label}</span>
        </Link>
    )
}

function AuditItem({ time, action, entity, user, status }: any) {
    return (
        <div className="flex items-center justify-between text-sm py-3 border-b last:border-0 hover:bg-slate-50 transition-colors px-2 rounded-lg">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{action}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1">{status}</Badge>
                </div>
                <span className="text-xs text-slate-500">{entity} • {user}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">{time}</span>
        </div>
    )
}
