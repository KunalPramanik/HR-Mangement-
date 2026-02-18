'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RunPayrollPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [result, setResult] = useState<any>(null);

    const handleRunPayroll = async () => {
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/payroll/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month, year })
            });

            const data = await res.json();

            if (res.ok) {
                setResult(data.data);
                toast.success('Payroll processed successfully!');
            } else {
                if (data.code === 'PAYROLL_FROZEN') {
                    toast.error('Payroll is currently FROZEN', {
                        description: 'Please unfreeze it in Settings before processing.'
                    });
                } else {
                    toast.error(data.error || 'Failed to process payroll');
                }
            }
        } catch (error) {
            toast.error('System Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1200px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="size-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-gray-600">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Run Payroll</h1>
                    <p className="text-[#6b7280] font-medium">Execute salary dispersion for {month} {year}.</p>
                </div>
            </div>

            {/* Config Card */}
            <div className="soft-card p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Month</label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-blue-500"
                        >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Year</label>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-blue-500"
                        >
                            {[2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleRunPayroll}
                        disabled={loading}
                        className={`
                            h-[50px] rounded-xl font-bold font-sans text-white shadow-lg flex items-center justify-center gap-2 transition-all
                            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#10b981] hover:bg-[#059669] hover:shadow-green-500/30'}
                        `}
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">payments</span>
                                Execute Payroll
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-xl text-yellow-800 text-sm flex items-start gap-3">
                    <span className="material-symbols-outlined shrink-0 text-yellow-600">info</span>
                    <p>
                        Processing payroll cannot be undone easily. Please ensure all <strong>Attendance</strong> and <strong>Leave</strong> records for this period are finalized before proceeding.
                    </p>
                </div>
            </div>

            {/* Results Section */}
            {result && (
                <div className="animate-fadeIn soft-card p-8 border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                            Payroll Summary
                        </h3>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Processed</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Employees</span>
                            <div className="text-3xl font-extrabold text-[#111827] mt-1">{result.totalEmployees || 0}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Payout</span>
                            <div className="text-3xl font-extrabold text-[#111827] mt-1">${(result.totalPayout || 0).toLocaleString()}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Processed Date</span>
                            <div className="text-sm font-bold text-[#111827] mt-2">{new Date(result.processedAt).toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button className="text-sm font-bold text-[#3b82f6] hover:underline flex items-center gap-1">
                            Download Bank Transfer File (CSV)
                            <span className="material-symbols-outlined text-[16px]">download</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
