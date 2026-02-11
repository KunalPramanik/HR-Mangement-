'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewEmployeePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert('New employee invitation sent!');
            router.push('/directory');
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
                    <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Onboard New Employee</h1>
                    <p className="text-[#6b7280] font-medium">Send an invitation to join the organization.</p>
                </div>
            </div>

            <div className="soft-card p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">First Name</label>
                            <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" placeholder="e.g. Alex" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">Last Name</label>
                            <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" placeholder="e.g. Morgan" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Work Email</label>
                        <input type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" placeholder="alex.morgan@company.com" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">Department</label>
                            <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700">
                                <option>Engineering</option>
                                <option>Product</option>
                                <option>Design</option>
                                <option>Marketing</option>
                                <option>HR</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">Role / Title</label>
                            <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" placeholder="e.g. Senior Developer" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Start Date</label>
                        <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => router.back()} className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-3 text-white font-bold bg-[#3b82f6] rounded-xl shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">person_add</span>
                            )}
                            Send Invitation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
