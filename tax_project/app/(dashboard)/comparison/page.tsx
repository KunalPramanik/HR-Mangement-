"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    {
        name: 'Total Tax',
        OldRegime: 120000,
        NewRegime: 85000,
    },
];

export default function ComparisonPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Tax Regime Comparison</h1>
                <p className="text-slate-500">See which tax regime saves you more money.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader>
                        <CardTitle className="text-blue-700">New Regime Recommendation</CardTitle>
                        <CardDescription>Based on your inputs, the New Regime is better.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-700">
                            Save ₹ 35,000
                        </div>
                        <p className="text-sm text-blue-600 mt-2">
                            By switching to the New Tax Regime (u/s 115BAC).
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tax Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="OldRegime" fill="#64748b" name="Old Regime" />
                                <Bar dataKey="NewRegime" fill="#2563eb" name="New Regime" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detailed Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="p-3">Component</th>
                                <th className="p-3">Old Regime</th>
                                <th className="p-3">New Regime</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="p-3 font-medium">Gross Total Income</td>
                                <td className="p-3">₹ 12,50,000</td>
                                <td className="p-3">₹ 12,50,000</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium">Total Deductions</td>
                                <td className="p-3 text-red-600">- ₹ 2,50,000</td>
                                <td className="p-3 text-red-600">- ₹ 50,000 (Std Ded)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium">Net Taxable Income</td>
                                <td className="p-3">₹ 10,00,000</td>
                                <td className="p-3">₹ 12,00,000</td>
                            </tr>
                            <tr className="bg-slate-50 font-bold">
                                <td className="p-3">Tax Payable</td>
                                <td className="p-3">₹ 1,12,500 + Cess</td>
                                <td className="p-3">₹ 82,500 + Cess</td>
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
