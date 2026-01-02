'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PayslipsPage() {
    const router = useRouter();

    const [payslips, setPayslips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchPayslips();
    }, []);

    const fetchPayslips = async () => {
        try {
            const res = await fetch('/api/payslips');
            if (res.ok) {
                const data = await res.json();
                setPayslips(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/payslips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate' })
            });
            if (res.ok) {
                alert('Payslips generated successfully!');
                fetchPayslips();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to generate');
            }
        } catch (error) {
            alert('Error generating payslips');
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = (payslip: any) => {
        // Create a printable HTML content
        const content = `
            <html>
                <head>
                    <title>Payslip - ${payslip.month}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .company { font-size: 24px; font-weight: bold; color: #135bec; }
                        .title { font-size: 18px; margin-top: 5px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                        .box { border: 1px solid #ccc; padding: 15px; border-radius: 8px; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                        .total-row { display: flex; justify-content: space-between; margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd; font-weight: bold; }
                        .net-pay { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; text-align: center; border-radius: 8px; margin-top: 20px; }
                        .net-pay h3 { margin: 0; color: #166534; font-size: 20px; }
                        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
                        @media print { button { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="company">Mindstar Tech</div>
                        <div class="title">Payslip for ${payslip.month}</div>
                        <p>${payslip.userId?.firstName} ${payslip.userId?.lastName}</p>
                    </div>

                    <div class="grid">
                        <div class="box">
                            <h4 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px;">Earnings</h4>
                            <div class="row"><span>Basic Salary</span><span>₹${payslip.basicSalary?.toLocaleString()}</span></div>
                            <div class="row"><span>HRA</span><span>₹${payslip.hra?.toLocaleString() || 0}</span></div>
                            <div class="row"><span>Special Allowance</span><span>₹${payslip.specialAllowance?.toLocaleString() || 0}</span></div>
                            <div class="row"><span>Other Allowances</span><span>₹${payslip.allowances?.toLocaleString() || 0}</span></div>
                            <div class="total-row"><span>Total Earnings</span><span>₹${((payslip.basicSalary || 0) + (payslip.hra || 0) + (payslip.specialAllowance || 0) + (payslip.allowances || 0)).toLocaleString()}</span></div>
                        </div>

                        <div class="box">
                            <h4 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px;">Deductions</h4>
                            <div class="row"><span>Provident Fund (PF)</span><span>₹${payslip.pf?.toLocaleString() || 0}</span></div>
                            <div class="row"><span>Professional Tax (PT)</span><span>₹${payslip.pt?.toLocaleString() || 0}</span></div>
                            <div class="row"><span>Income Tax / TDS</span><span>₹${payslip.metadata?.tax?.toLocaleString() || 0}</span></div>
                            <div class="row"><span>Other Deductions</span><span>₹${payslip.deductions?.toLocaleString() || 0}</span></div>
                            <div class="total-row"><span>Total Deductions</span><span>₹${((payslip.pf || 0) + (payslip.pt || 0) + (payslip.metadata?.tax || 0) + (payslip.deductions || 0)).toLocaleString()}</span></div>
                        </div>
                    </div>

                    <div class="net-pay">
                        <p style="margin:0; font-size:12px; color:#166534;">Net Payable Details</p>
                        <h3>₹${payslip.netSalary?.toLocaleString()}</h3>
                        <p style="margin:5px 0 0 0; font-size:12px;">(${payslip.status})</p>
                    </div>

                    <div class="footer">
                        <p>This is a computer-generated document and does not require a signature.</p>
                        <button onclick="window.print()" style="padding:10px 20px; cursor:pointer; background:#135bec; color:white; border:none; border-radius:5px; font-weight:bold;">Print / Save as PDF</button>
                    </div>
                </body>
            </html>
        `;

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(content);
            newWindow.document.close();
        } else {
            alert('Popup blocked. Please allow popups to view the payslip.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Payslips</h1>
                </div>
                {/* Temporary Generate Button for HR/Admin testing */}
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                >
                    {generating ? 'Generating...' : 'Generate New'}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : payslips.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No payslips found</div>
            ) : (
                <div className="flex flex-col gap-3">
                    {payslips.map(payslip => (
                        <div key={payslip._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <span className="material-symbols-outlined">receipt_long</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">
                                        {payslip.userId?.firstName ? `${payslip.userId.firstName} ${payslip.userId.lastName} - ` : ''}
                                        {payslip.month}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Amount: ₹{payslip.netSalary?.toLocaleString()} | Status: {payslip.status}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-900 dark:text-white">₹{payslip.netSalary?.toLocaleString()}</p>
                                <button
                                    onClick={() => handleDownload(payslip)}
                                    className="text-[#135bec] text-xs font-bold mt-1 hover:underline"
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
