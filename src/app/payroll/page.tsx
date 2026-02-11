'use client';

import { useSession } from 'next-auth/react';

export default function PayrollPage() {
    const { data: session } = useSession();

    const payrollData = [
        { month: 'December 2024', status: 'Paid', amount: '$4,280.00', date: 'Dec 28, 2024' },
        { month: 'November 2024', status: 'Paid', amount: '$4,280.00', date: 'Nov 28, 2024' },
        { month: 'October 2024', status: 'Paid', amount: '$4,280.00', date: 'Oct 28, 2024' },
    ];

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">My Payroll</h1>
                    <p className="text-[#6b7280] font-medium">Access your salary details and tax documents.</p>
                </div>
                <button className="px-6 py-3 rounded-full bg-[#10b981] text-white font-bold text-sm shadow-lg shadow-green-500/30 flex items-center gap-2 hover:bg-[#059669] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Download Tax Report
                </button>
            </div>

            {/* Salary Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="soft-card p-8 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white">
                    <p className="text-blue-100 font-bold text-xs uppercase tracking-wider mb-2">Net Salary (Dec)</p>
                    <h3 className="text-4xl font-extrabold tracking-tight mb-1">$4,280.00</h3>
                    <div className="flex items-center gap-1 text-blue-100 text-sm font-medium">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Disbursed on Dec 28
                    </div>
                </div>

                <div className="soft-card p-8 bg-white nav-item">
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Gross Earnings</p>
                    <h3 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-1">$5,100.00</h3>
                    <p className="text-green-500 font-bold text-sm">+2.5% from last month</p>
                </div>

                <div className="soft-card p-8 bg-white">
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Total Deductions</p>
                    <h3 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-1">$820.00</h3>
                    <p className="text-gray-400 font-medium text-sm">Tax, Insurance, PF</p>
                </div>
            </div>

            {/* Payslip History */}
            <div className="soft-card p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#111827]">Payslip History</h3>
                    <button className="text-[#3b82f6] font-bold text-sm">View All</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                <th className="pb-4 pl-4">Month</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4">Amount</th>
                                <th className="pb-4">Payment Date</th>
                                <th className="pb-4 text-right pr-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                            {payrollData.map((item, i) => (
                                <tr key={i} className="group hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-50">
                                    <td className="py-4 pl-4 font-bold text-[#111827]">{item.month}</td>
                                    <td className="py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                            <span className="size-1.5 rounded-full bg-green-500"></span>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-[#111827]">{item.amount}</td>
                                    <td className="py-4 text-gray-500">{item.date}</td>
                                    <td className="py-4 text-right pr-4">
                                        <button className="p-2 rounded-full hover:bg-blue-50 text-[#3b82f6] transition-colors" title="Download Slip">
                                            <span className="material-symbols-outlined text-[20px]">cloud_download</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Salary Structure Breakdown */}
            <div className="soft-card p-8">
                <h3 className="text-xl font-bold text-[#111827] mb-6">Salary Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Earnings */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Earnings</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Basic Salary</span>
                                <span className="text-[#111827] font-bold">$3,000.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">HRA (Housing)</span>
                                <span className="text-[#111827] font-bold">$1,500.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Special Allowance</span>
                                <span className="text-[#111827] font-bold">$600.00</span>
                            </div>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Deductions</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Income Tax</span>
                                <span className="text-red-500 font-bold">-$450.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Provident Fund</span>
                                <span className="text-red-500 font-bold">-$220.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Health Insurance</span>
                                <span className="text-red-500 font-bold">-$150.00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
