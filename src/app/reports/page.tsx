'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ReportsPage() {
    const router = useRouter();
    const [reportType, setReportType] = useState('Daily');
    const [submitting, setSubmitting] = useState(false);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async () => {
        if (!subject || !content) return toast.error('Please fill all fields');
        setSubmitting(true);
        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: reportType, subject, content })
            });

            if (res.ok) {
                toast.success('Report submitted successfully!');
                setSubject('');
                setContent('');
                router.refresh();
            } else {
                toast.error('Failed to submit report');
            }
        } catch (error) {
            toast.error('Error submitting report');
        } finally {
            setSubmitting(false);
        }
    };

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
                        onClick={() => setReportType('Daily')}
                        className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${reportType === 'Daily' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        Daily Status
                    </button>
                    <button
                        onClick={() => setReportType('Incident')}
                        className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${reportType === 'Incident' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        Incident Log
                    </button>
                </div>

                <div className="space-y-6 max-w-2xl">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Subject</label>
                        <input
                            type="text"
                            placeholder="Brief summary..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Details</label>
                        <textarea
                            rows={6}
                            placeholder="Describe the report content..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all resize-none"
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-3 rounded-xl bg-[#111827] text-white font-bold shadow-lg shadow-gray-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                            Submit Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Reports List (Optional Enhancement) */}
            <div className="soft-card p-8 opacity-90">
                <h3 className="text-lg font-bold mb-4">You can view your history in the History Tab.</h3>
            </div>
        </div>
    );
}
