"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge" // Need to create Badge
import {
    Play,
    Lock,
    FileText,
    CheckCircle,
    AlertTriangle,
    Download
} from "lucide-react"

export default function PayrollHub() {
    // This state would eventually come from the backend
    const [status, setStatus] = useState<"DRAFT" | "CALCULATED" | "FINALIZED" | "PAID" | "LOCKED">("DRAFT")
    const [month, setMonth] = useState("October 2024")

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Payroll Processing Hub</h1>
                    <p className="text-slate-500">Cycle: {month}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">Current State:</span>
                    <StateBadge status={status} />
                </div>
            </div>

            {/* Action Control Panel */}
            <Card className="border-t-4 border-t-blue-600">
                <CardHeader>
                    <CardTitle>Control Panel</CardTitle>
                    <CardDescription>Execute payroll actions. Transitions are irreversible.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">

                    {/* DRAFT -> CALCULATED */}
                    <Button
                        disabled={status !== 'DRAFT'}
                        className="gap-2"
                    >
                        <Play className="w-4 h-4" /> Calculate Payroll
                    </Button>

                    {/* CALCULATED -> FINALIZED */}
                    <Button
                        disabled={status !== 'CALCULATED'}
                        variant="secondary"
                        className="gap-2"
                    >
                        <CheckCircle className="w-4 h-4" /> Finalize for Payment
                    </Button>

                    {/* FINALIZED -> PAID */}
                    <Button
                        disabled={status !== 'FINALIZED'}
                        variant="outline"
                        className="gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    >
                        <CheckCircle className="w-4 h-4" /> Mark as Paid
                    </Button>

                    {/* PAID -> LOCKED */}
                    <Button
                        disabled={status !== 'PAID'}
                        variant="destructive"
                        className="gap-2"
                    >
                        <Lock className="w-4 h-4" /> Lock Payroll
                    </Button>

                </CardContent>
            </Card>

            {/* Outputs Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Outputs & Reports</CardTitle>
                        <CardDescription>Available after calculation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start gap-2" disabled={status === 'DRAFT'}>
                            <FileText className="w-4 h-4" /> Generate Payslips (PDF)
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2" disabled={status === 'DRAFT'}>
                            <Download className="w-4 h-4" /> Export Bank Advice File
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2" disabled={status === 'DRAFT'}>
                            <Download className="w-4 h-4" /> Export PF/NPS Schedule
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Validation Status</CardTitle>
                        <CardDescription>System integrity checks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <ValidationItem label="Employee PAN Verification" valid={true} />
                            <ValidationItem label="Salary Structure Completeness" valid={true} />
                            <ValidationItem label="Tax Regime Selection" valid={true} />
                            <ValidationItem label="Bank Account Details" valid={true} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StateBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        DRAFT: "bg-slate-100 text-slate-600",
        CALCULATED: "bg-blue-100 text-blue-700",
        FINALIZED: "bg-purple-100 text-purple-700",
        PAID: "bg-green-100 text-green-700",
        LOCKED: "bg-red-100 text-red-700 border-red-200"
    }
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.DRAFT}`}>
            {status}
        </span>
    )
}

function ValidationItem({ label, valid }: { label: string, valid: boolean }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{label}</span>
            {valid ? (
                <span className="flex items-center text-green-600 text-xs font-medium gap-1">
                    <CheckCircle className="w-3 h-3" /> Pass
                </span>
            ) : (
                <span className="flex items-center text-red-600 text-xs font-medium gap-1">
                    <AlertTriangle className="w-3 h-3" /> Fail
                </span>
            )}
        </div>
    )
}
