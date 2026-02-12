'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewEmployeePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [managers, setManagers] = useState([
        { id: '101', name: 'Sarah Jenkins', role: 'Director of Engineering' },
        { id: '102', name: 'James Wilson', role: 'Product Lead' },
        { id: '103', name: 'Elena Rodriguez', role: 'HR Manager' },
        { id: '104', name: 'Michael Chen', role: 'VP of Operations' }
    ]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate Enterprise API call
        setTimeout(() => {
            setLoading(false);
            alert('Employee ID: EMP-' + Math.floor(Math.random() * 10000) + ' created successfully. Welcome kit email sent.');
            router.push('/directory');
        }, 1500);
    };

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-4xl mx-auto min-h-screen">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="size-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-gray-600">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Enterprise Onboarding</h1>
                    <p className="text-[#6b7280] font-medium">Register new talent with full compliance details.</p>
                </div>
            </div>

            <div className="soft-card p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                    {/* Section 1: Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-[#111827] border-b border-gray-100 pb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">person</span>
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">First Name <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" placeholder="e.g. Alex" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Last Name <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" placeholder="e.g. Morgan" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Work Email <span className="text-red-500">*</span></label>
                                <input type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" placeholder="alex.morgan@company.com" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                                <input type="tel" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" placeholder="+1 (555) 000-0000" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Gender</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Non-Binary">Non-Binary</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Marital Status</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700">
                                    <option value="">Select Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Employment Details (New) */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-[#111827] border-b border-gray-100 pb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-500">badge</span>
                            Employment Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Join Date <span className="text-red-500">*</span></label>
                                <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Designation / Role <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" placeholder="e.g. Senior Developer" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Employment Type <span className="text-red-500">*</span></label>
                                <select required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700">
                                    <option value="Full-Time">Full-Time</option>
                                    <option value="Part-Time">Part-Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Intern">Intern</option>
                                    <option value="Consultant">Consultant</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Probation Period</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700">
                                    <option value="None">None</option>
                                    <option value="3 Months">3 Months</option>
                                    <option value="6 Months">6 Months</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Work Mode</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700">
                                    <option value="On-Site">On-Site</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Shift Type</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700">
                                    <option value="General">General (9AM - 6PM)</option>
                                    <option value="Rotational">Rotational</option>
                                    <option value="Night">Night Shift</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Organization Mapping (Reporting) */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-[#111827] border-b border-gray-100 pb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-500">lan</span>
                            Organization Mapping
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Department</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700">
                                    <option>Engineering</option>
                                    <option>Product</option>
                                    <option>Design</option>
                                    <option>Marketing</option>
                                    <option>HR</option>
                                    <option>Operations</option>
                                    <option>Finance</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Work Location</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700">
                                    <option>Headquarters (NY)</option>
                                    <option>London Office</option>
                                    <option>Bangalore Hub</option>
                                    <option>Berlin Hub</option>
                                    <option>Remote</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-700">Reporting Manager <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700 appearance-none">
                                        <option value="">Select Reporting Authority...</option>
                                        {managers.map(manager => (
                                            <option key={manager.id} value={manager.id}>
                                                {manager.name} — {manager.role}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">This will define the workflow approvals for Leave and Appraisals.</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Compensation (New) */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-[#111827] border-b border-gray-100 pb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500">payments</span>
                            Compensation Structure
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Annual CTC</label>
                                <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" placeholder="0.00" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Basic Salary</label>
                                <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" placeholder="0.00" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Variable Pay %</label>
                                <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] font-medium text-gray-700" placeholder="0%" />
                            </div>
                        </div>
                        <div className="flex items-center gap-6 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="size-5 accent-blue-600 rounded" defaultChecked />
                                <span className="text-sm font-medium text-gray-700">PF Eligible</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="size-5 accent-blue-600 rounded" defaultChecked />
                                <span className="text-sm font-medium text-gray-700">TDS Applicable</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="size-5 accent-blue-600 rounded" />
                                <span className="text-sm font-medium text-gray-700">Bonus Eligible</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-8 border-t border-gray-100">
                        <button type="button" onClick={() => router.back()} className="flex-1 py-4 text-gray-600 font-bold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 text-white font-bold bg-[#111827] rounded-xl shadow-lg shadow-gray-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-[24px]">check_circle</span>
                            )}
                            Create Employee Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
