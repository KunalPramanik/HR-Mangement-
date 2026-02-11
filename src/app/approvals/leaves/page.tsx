'use client';

import { useState } from 'react';

export default function LeaveApprovalsPage() {
    const [activeTab, setActiveTab] = useState('pending');

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] mb-2">Leave Approvals</h1>
                    <p className="text-[#6b7280] font-medium">Manage and review employee time-off requests.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 pb-1">
                {['pending', 'approved', 'rejected'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-bold text-sm uppercase tracking-wider border-b-2 transition-all ${activeTab === tab ? 'border-[#3b82f6] text-[#3b82f6]' : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="soft-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">EW</div>
                            <div>
                                <h3 className="font-bold text-[#111827]">Emily Watson</h3>
                                <p className="text-sm text-gray-500">Sick Leave • Oct 24 - Oct 26 (3 Days)</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 rounded-lg bg-green-50 text-green-600 font-bold text-sm hover:bg-green-100 transition-colors">Approve</button>
                            <button className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors">Reject</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
