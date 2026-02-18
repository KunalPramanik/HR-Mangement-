'use client';

import { useState } from 'react';

export default function ReportsPage() {
    const [reportType, setReportType] = useState('Attendance');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [generatedData, setGeneratedData] = useState<any[]>([]);
    const [generating, setGenerating] = useState(false);

    const generateReport = async () => {
        setGenerating(true);
        // Simulate API call with filters
        // In a real app, this would POST to /api/reports/generate
        // For now, we mock data based on type to show "No 1" UI
        setTimeout(() => {
            const mockData = [
                { id: 1, name: 'John Doe', date: '2025-01-15', status: 'Present', hours: 8.5 },
                { id: 2, name: 'Jane Smith', date: '2025-01-15', status: 'Late', hours: 7.8 },
                { id: 3, name: 'Alice Johnson', date: '2025-01-15', status: 'Absent', hours: 0 },
            ];
            setGeneratedData(mockData);
            setGenerating(false);
        }, 1000);
    };

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
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700"
                        >
                            <option value="Attendance">Attendance Log</option>
                            <option value="Payroll">Payroll Summary</option>
                            <option value="Performance">Performance Reviews</option>
                            <option value="Recruitment">Recruitment Pipeline</option>
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
                    {/* Status Filter */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Active">Active / Present</option>
                            <option value="Pending">Pending / Late</option>
                            <option value="Inactive">Inactive / Absent</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter('All'); setGeneratedData([]); }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                    >
                        <span className="material-symbols-outlined">restart_alt</span>
                        Reset
                    </button>
                    <button
                        onClick={generateReport}
                        disabled={generating}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3b82f6] text-white font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                    >
                        {generating ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined">download</span>
                        )}
                        Generate Report
                    </button>
                </div>

                {/* Data Preview */}
                {generatedData.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-100 animate-fadeIn">
                        <h4 className="font-bold text-lg mb-4">Preview: {reportType} Report</h4>
                        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-500">
                                    <tr>
                                        <th className="px-6 py-3">Employee</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {generatedData.map((row) => (
                                        <tr key={row.id}>
                                            <td className="px-6 py-3 font-medium">{row.name}</td>
                                            <td className="px-6 py-3 text-gray-500">{row.date}</td>
                                            <td className="px-6 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                        row.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>{row.status}</span>
                                            </td>
                                            <td className="px-6 py-3 font-bold">{row.hours}h</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
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
