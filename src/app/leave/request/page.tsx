'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LeaveRequestPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            alert('Leave request submitted!');
            router.push('/approvals/leaves');
        }, 1000);
    };

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-2xl mx-auto min-h-screen">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="size-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-gray-600">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">New Leave Request</h1>
                    <p className="text-[#6b7280] font-medium">Submit your time off application.</p>
                </div>
            </div>

            <div className="soft-card p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Leave Type */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Leave Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Annual', 'Sick', 'Unpaid', 'Maternity/Paternity'].map((type) => (
                                <label key={type} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all">
                                    <input type="radio" name="leaveType" className="accent-blue-600 size-4" required />
                                    <span className="text-sm font-bold text-gray-700">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">Start Date</label>
                            <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">End Date</label>
                            <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Reason / Notes</label>
                        <textarea
                            rows={4}
                            placeholder="Please maintain brevity..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700 resize-none"
                        ></textarea>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => router.back()} className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-[2] py-3 text-white font-bold bg-[#3b82f6] rounded-xl shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            )}
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
