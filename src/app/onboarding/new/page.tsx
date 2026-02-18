'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewHirePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        position: '',
        department: 'Engineering',
        startDate: '',
        role: 'employee'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users', { // Assuming creation via users API for now
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, password: 'password123' }) // Default password
            });

            if (res.ok) {
                toast.success('New Hire Added Successfully');
                router.push('/directory'); // Or onboarding list
            } else {
                toast.error('Failed to add new hire');
            }
        } catch (error) {
            toast.error('Error submitting form');
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">New Employee Onboarding</h1>
            <p className="text-slate-500 mb-8">Add a new team member to the organization.</p>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                        <input
                            required
                            value={formData.firstName}
                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border dark:bg-slate-700 border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                        <input
                            required
                            value={formData.lastName}
                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border dark:bg-slate-700 border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Work Email</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-slate-700 border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Position / Title</label>
                        <input
                            required
                            value={formData.position}
                            onChange={e => setFormData({ ...formData, position: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border dark:bg-slate-700 border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Department</label>
                        <select
                            value={formData.department}
                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border dark:bg-slate-700 border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>Engineering</option>
                            <option>Design</option>
                            <option>Product</option>
                            <option>Marketing</option>
                            <option>Sales</option>
                            <option>HR</option>
                            <option>Finance</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                    <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border dark:bg-slate-700 border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition">Cancel</button>
                    <button
                        type="submit"
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        Create Profile
                    </button>
                </div>
            </form>
        </div>
    );
}
