'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PayrollPage() {
    const router = useRouter();
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [summary, setSummary] = useState({ generated: 0, skipped: 0, errors: 0 });
    const [isProcessed, setIsProcessed] = useState(false);

    const handleProcess = async (runType: 'dry-run' | 'commit') => {
        setLoading(true);
        try {
            const res = await fetch('/api/payroll/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month, runType })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setPreviewData(data.results.details || []);
                    setSummary({
                        generated: data.results.generated,
                        skipped: data.results.skipped,
                        errors: data.results.errors
                    });
                    if (runType === 'commit') {
                        setIsProcessed(true);
                        alert(`Payroll finalized for ${month}. ${data.results.generated} payslips generated.`);
                    }
                }
            } else {
                const err = await res.json();
                alert('Error: ' + err.error);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to process payroll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Payroll Processor</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Control Panel */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-1">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Run Payroll Cycle</h2>
                    <label className="block mb-4">
                        <span className="text-sm font-medium text-slate-500">Select Month</span>
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => { setMonth(e.target.value); setIsProcessed(false); setPreviewData([]); }}
                            className="w-full mt-1 p-3 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white dark:border-slate-600 font-bold"
                        />
                    </label>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => handleProcess('dry-run')}
                            disabled={loading || isProcessed}
                            className="w-full py-3 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing...' : '1. Preview Calculation'}
                        </button>
                        <button
                            onClick={() => {
                                if (confirm(`Are you sure you want to finalize payroll for ${month}? This will generate payslips.`)) {
                                    handleProcess('commit');
                                }
                            }}
                            disabled={loading || previewData.length === 0 || isProcessed}
                            className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined">payments</span>
                            2. Finalize & Generate
                        </button>
                    </div>

                    {isProcessed && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                            <p className="text-green-700 dark:text-green-400 font-bold">✓ Payroll Finalized</p>
                            <button onClick={() => router.push('/hr/reports')} className="text-xs text-blue-600 underline mt-1">View Reports</button>
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <p className="text-slate-500 text-xs uppercase font-bold">Processed</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{summary.generated}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <p className="text-slate-500 text-xs uppercase font-bold">Skipped (Already Done)</p>
                        <p className="text-3xl font-bold text-orange-500 mt-2">{summary.skipped}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <p className="text-slate-500 text-xs uppercase font-bold">Errors</p>
                        <p className="text-3xl font-bold text-red-500 mt-2">{summary.errors}</p>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white">Salary Register ({month})</h3>
                    <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                        {previewData.length} Records
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3 text-right">LOP Days</th>
                                <th className="px-4 py-3 text-right">Net Salary</th>
                                <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {previewData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                        Click "Preview Calculation" to see payroll data.
                                    </td>
                                </tr>
                            ) : previewData.map((record, idx) => (
                                <tr key={idx} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                        {record.name}
                                        {record.error && <p className="text-xs text-red-500">{record.error}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                                        {record.lopDays}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                                        ₹{record.netSalary?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${record.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
