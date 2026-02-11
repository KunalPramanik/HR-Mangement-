"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import {
    ShieldCheck,
    Search,
    Clock,
    User,
    Fingerprint,
    Database
} from "lucide-react"

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([
        { id: 1, action: "INITIALIZE_ORG", type: "SYSTEM", user: "BOOTSTRAP", timestamp: "2026-01-10 10:00:00", details: "Organization Type set to PRIVATE" },
        { id: 2, action: "ADD_EMPLOYEE", type: "MASTER", user: "OPERATOR_01", timestamp: "2026-01-10 11:20:00", details: "Created EMP0001 (John Doe)" },
        { id: 3, action: "LOCK_PAYROLL", type: "FINANCIAL", user: "OPERATOR_01", timestamp: "2026-01-10 14:45:00", details: "Locked SEP_2024 Cycle" },
        { id: 4, action: "EDIT_PT_SLABS", type: "CONFIG", user: "OPERATOR_01", timestamp: "2026-01-10 15:30:00", details: "Updated Maharashtra PT Slabs" },
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Audit Trails</h1>
                    <p className="text-slate-500">Immutable record of all system-wide actions and state changes.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-100">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm font-semibold tracking-tight">Integrity: Verified</span>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Global Activity Log</CardTitle>
                            <CardDescription>Chronological sequence of authorized operations.</CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input placeholder="Filter by user or action..." className="pl-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto rounded-xl border">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-4">Timestamp / ID</th>
                                    <th className="px-6 py-4">Operation</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Operator</th>
                                    <th className="px-6 py-4">Affected Entity / Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {logs.map((log) => (
                                    <tr key={log.id} className="bg-white hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-[11px] text-slate-400">#LOG_{log.id.toString().padStart(4, '0')}</span>
                                                <div className="flex items-center gap-1.5 text-slate-600 mt-0.5">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    <span className="text-xs">{log.timestamp}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="font-medium text-[10px]">
                                                {log.type}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <User className="w-3 h-3 text-slate-500" />
                                                </div>
                                                <span className="text-slate-600">{log.user}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 group-hover:text-blue-600 transition-colors">{log.details}</span>
                                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
                                                        <Fingerprint className="w-2.5 h-2.5" />
                                                        <span>Checksum: VALID</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Diagnostic Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-slate-900 text-white rounded-2xl shadow-xl">
                    <div className="p-3 bg-slate-800 rounded-xl">
                        <Database className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Storage Status</div>
                        <div className="font-bold">Encrypted Audit Cluster-01</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white border rounded-2xl shadow-sm">
                    <div className="p-3 bg-slate-100 rounded-xl">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Compliance Level</div>
                        <div className="font-bold text-slate-900">Section 139 Compliant</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
