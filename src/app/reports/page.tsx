'use client';

import { useState } from 'react';

export default function ReportsPage() {
    const [reportType, setReportType] = useState('daily');

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">Submit Report</h1>
                    <p className="text-[#6b7280] font-medium">Log your daily activities or incidents.</p>
                </div>
            </div>

            {/* Form */}
            <div className="soft-card p-8">
                <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-4">
                    <button
                        onClick={() => setReportType('daily')}
                        className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${reportType === 'daily' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        Daily Status
                    </button>
                    <button
                        onClick={() => setReportType('incident')}
                        className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${reportType === 'incident' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        Incident Log
                    </button>
                </div>

                <div className="space-y-6 max-w-2xl">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Subject</label>
                        <input type="text" placeholder="Brief summary..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Details</label>
                        <textarea rows={6} placeholder="Describe the report content..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all resize-none"></textarea>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">Cancel</button>
                        <button className="px-6 py-3 rounded-xl bg-[#111827] text-white font-bold shadow-lg shadow-gray-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">Submit Report</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
