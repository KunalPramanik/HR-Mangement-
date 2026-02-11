"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import {
    History,
    FileDown,
    Search,
    Filter,
    CalendarCheck,
    Lock
} from "lucide-react"

export default function PayrollHistoryPage() {
    const history = [
        { id: 1, month: "September", year: 2024, gross: "₹ 27,80,000", net: "₹ 23,40,000", employees: 41, status: "LOCKED" },
        { id: 2, month: "August", year: 2024, gross: "₹ 27,50,000", net: "₹ 23,10,000", employees: 41, status: "LOCKED" },
        { id: 3, month: "July", year: 2024, gross: "₹ 26,90,000", net: "₹ 22,60,000", employees: 40, status: "LOCKED" },
        { id: 4, month: "June", year: 2024, gross: "₹ 26,80,000", net: "₹ 22,50,000", employees: 40, status: "LOCKED" },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Past Payroll Cycles</h1>
                    <p className="text-slate-500">Historical records of all disbursed and locked payrolls.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" /> Filter By Year
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Archived Cycles (FY 2024-25)</CardTitle>
                            <CardDescription>Locked cycles are read-only and immutable.</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9"
                                placeholder="Search month..."
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto rounded-xl border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b">
                                <tr>
                                    <th className="px-6 py-4">Cycle Period</th>
                                    <th className="px-6 py-4">Employee Count</th>
                                    <th className="px-6 py-4">Gross Disbursement</th>
                                    <th className="px-6 py-4">Net Payout</th>
                                    <th className="px-6 py-4">System State</th>
                                    <th className="px-6 py-4 text-right">Documents</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {history.map((cycle) => (
                                    <tr key={cycle.id} className="hover:bg-slate-50 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg">
                                                    <CalendarCheck className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{cycle.month} {cycle.year}</span>
                                                    <span className="text-xs text-slate-400 tracking-tighter">ID: CYC_2024_{cycle.month.substring(0, 3).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-600">
                                            {cycle.employees} Staff Members
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {cycle.gross}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-700">
                                            {cycle.net}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Lock className="w-3.5 h-3.5 text-red-500" />
                                                <Badge className="bg-red-50 text-red-700 border-red-100 uppercase tracking-tighter hover:bg-red-50">
                                                    {cycle.status}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="ghost" className="h-8 gap-2 text-xs font-semibold hover:text-blue-600 hover:bg-blue-50">
                                                    <FileDown className="w-3.5 h-3.5" /> Register
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 gap-2 text-xs font-semibold hover:text-blue-600 hover:bg-blue-50">
                                                    <FileDown className="w-3.5 h-3.5" /> Bank File
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
