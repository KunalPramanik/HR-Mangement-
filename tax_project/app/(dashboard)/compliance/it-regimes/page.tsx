"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Scale, Info, CheckCircle2, AlertTriangle } from "lucide-react"

const data = [
    {
        name: 'Income Tax',
        OldRegime: 112500,
        NewRegime: 82500,
    },
];

export default function TaxRegimesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Tax Regime Analysis</h1>
                    <p className="text-slate-500">System-wide analysis of Old vs New Tax Regimes (FY 2024-25)</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600 text-white border-none py-1.5 px-3">
                        Assessment Year: 2025-26
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 bg-gradient-to-br from-indigo-700 to-blue-800 text-white border-none shadow-xl">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Scale className="w-5 h-5 text-indigo-300" />
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">System Choice</span>
                        </div>
                        <CardTitle className="text-2xl text-white">New Regime is Default</CardTitle>
                        <CardDescription className="text-indigo-100">u/s 115BAC of Income Tax Act</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm leading-relaxed opacity-90">
                            Starting FY 2023-24, the New Tax Regime is the default choice. Employees must explicitly choose "Old" to avail deductions.
                        </p>
                        <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                            <div className="flex items-center justify-between font-bold">
                                <span>Optimization Gain</span>
                                <span className="text-green-300 text-xl">₹ 30,000</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 shadow-lg">
                    <CardHeader>
                        <CardTitle>Tax Liability Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Legend iconType="circle" />
                                <Bar dataKey="OldRegime" fill="#94a3b8" name="Old Regime (With Deductions)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="NewRegime" fill="#2563eb" name="New Regime (Default)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-md">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-lg">Comparison Matrix</CardTitle>
                    <CardDescription>Breakdown for a sample salary of ₹ 12,50,000</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest font-bold">
                                <tr>
                                    <th className="px-6 py-4">Financial Component</th>
                                    <th className="px-6 py-4">Old Regime</th>
                                    <th className="px-6 py-4">New Regime</th>
                                    <th className="px-6 py-4">Reasoning</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <MatrixRow
                                    label="Basic + HRA + Allowances"
                                    oldV="₹ 12,50,000"
                                    newV="₹ 12,50,000"
                                    desc="Income remains same"
                                />
                                <MatrixRow
                                    label="Deductions (80C, 80D, etc)"
                                    oldV="- ₹ 2,00,000"
                                    newV="N/A"
                                    desc="Not eligible in New"
                                    highlightOld
                                />
                                <MatrixRow
                                    label="Standard Deduction"
                                    oldV="- ₹ 50,000"
                                    newV="- ₹ 50,000"
                                    desc="Applicable to both"
                                />
                                <MatrixRow
                                    label="Taxable Income"
                                    oldV="₹ 10,00,000"
                                    newV="₹ 12,00,000"
                                    desc="Base for tax calc"
                                />
                                <tr className="bg-blue-50/50">
                                    <td className="px-6 py-5 font-bold text-slate-900 underline underline-offset-4 decoration-blue-500">Effective Tax Payout</td>
                                    <td className="px-6 py-5 font-bold text-slate-600">₹ 1,12,500</td>
                                    <td className="px-6 py-5 font-bold text-blue-700">₹ 82,500</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                                            <CheckCircle2 className="w-4 h-4" /> 26.6% Lower
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Compliance Note */}
            <div className="p-4 rounded-xl border bg-slate-50 flex gap-4">
                <div className="p-2 rounded-full bg-slate-200 h-fit">
                    <Info className="w-5 h-5 text-slate-600" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">Operator Rule & Compliance</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Under Indian Income Tax rules, an employee's choice of regime is fixed for the financial year. The operator MUST collect a formal declaration from the employee before the first payroll cycle of the FY. Silent changes after calculation are strictly prohibited.
                    </p>
                </div>
            </div>
        </div>
    )
}

function MatrixRow({ label, oldV, newV, desc, highlightOld = false }: any) {
    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4 font-medium text-slate-900">{label}</td>
            <td className={`px-6 py-4 ${highlightOld ? 'text-red-600 line-through decoration-slate-300' : 'text-slate-600'}`}>{oldV}</td>
            <td className="px-6 py-4 text-slate-900">{newV}</td>
            <td className="px-6 py-4 italic text-slate-400 text-xs">{desc}</td>
        </tr>
    )
}
