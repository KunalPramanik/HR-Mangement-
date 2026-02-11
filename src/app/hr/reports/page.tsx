'use client';

import { useState } from 'react';

export default function ReportsPage() {
    const [reportType, setReportType] = useState('daily');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">Reports & Analytics</h1>
                    <p className="text-[#6b7280] font-medium">Data-driven insights for HR.</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat 1 */}
                <div className="soft-card p-6 border-l-4 border-blue-500">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Employees</p>
                    <h3 className="text-3xl font-extrabold text-[#111827]">142</h3>
                    <p className="text-green-500 font-bold text-xs mt-1">+12 this month</p>
                </div>
                {/* Stat 2 */}
                <div className="soft-card p-6 border-l-4 border-green-500">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Attendance Rate</p>
                    <h3 className="text-3xl font-extrabold text-[#111827]">96%</h3>
                    <p className="text-green-500 font-bold text-xs mt-1">Excellent</p>
                </div>
                {/* Stat 3 */}
                <div className="soft-card p-6 border-l-4 border-purple-500">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Leave Requests</p>
                    <h3 className="text-3xl font-extrabold text-[#111827]">8</h3>
                    <p className="text-yellow-500 font-bold text-xs mt-1">Pending Approval</p>
                </div>
                {/* Stat 4 */}
                <div className="soft-card p-6 border-l-4 border-orange-500">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Turnover Rate</p>
                    <h3 className="text-3xl font-extrabold text-[#111827]">1.2%</h3>
                    <p className="text-gray-400 font-bold text-xs mt-1">Last Quarter</p>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="soft-card p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-[#111827] text-lg">Generate Custom Report</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Report Type</label>
                        <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700">
                            <option>Attendance Log</option>
                            <option>Payroll Summary</option>
                            <option>Performance Reviews</option>
                            <option>Recruitment Pipeline</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">End Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">
                        <span className="material-symbols-outlined">restart_alt</span>
                        Reset
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3b82f6] text-white font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <span className="material-symbols-outlined">download</span>
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            <div className="soft-card p-8">
                <h3 className="font-bold text-[#111827] text-lg mb-6">Archive</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                <th className="pb-4 pl-4">Report Name</th>
                                <th className="pb-4">Date Generated</th>
                                <th className="pb-4">Generated By</th>
                                <th className="pb-4 text-right pr-4">Size</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                            {[1, 2, 3].map((i) => (
                                <tr key={i} className="group hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                    <td className="py-4 pl-4 font-bold text-[#111827] flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                        Monthly_Payroll_Jan_2025.pdf
                                    </td>
                                    <td className="py-4 text-gray-500">Jan 31, 2025</td>
                                    <td className="py-4 text-gray-500">System Admin</td>
                                    <td className="py-4 text-right pr-4 text-gray-400">2.4 MB</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
