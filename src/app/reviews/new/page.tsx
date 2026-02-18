'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewReviewCyclePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        cycleName: 'Q1 2026 Performance Review',
        startDate: '',
        endDate: '',
        participants: 'All Employees' // Simplified for UI
    });

    const handleCreate = async () => {
        setSubmitting(true);
        try {
            // Fetch users to include based on selection
            // For MVP: Fetch ALL active users
            const usersRes = await fetch('/api/users?status=active'); // Need to ensure GET /api/users supports this filter or returns all for admin
            // Wait, GET /api/users currently only returns single user or filtered list? 
            // My GET /api/users/[id] logic is for single user.
            // I need GET /api/users (plural) to fetch list. I haven't created that yet!

            // Assuming I create GET /api/users below:
            // For now, let's mock the user list or just send a flag to backend to "auto-select all". -> Backend handles it.

            const payload = {
                cycleName: formData.cycleName,
                startDate: formData.startDate,
                endDate: formData.endDate,
                participants: [] // Empty means backend should fetch ALL? Or I need to fetch here?
                // Better: Backend logic handles "All Employees" flag. But my backend expects array.
                // Let's stick to simple: Backend requires array. Frontend must fetch.
            };

            // Temporary: Fetch fake users or just minimal payload for testing?
            // Real implement: I need GET /api/users endpoint.

            // Let's create `src/app/api/users/route.ts` first!

        } catch (error) {
            alert('Failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-extrabold text-[#111827] mb-8">Start New Review Cycle</h1>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Cycle Name</label>
                        <input
                            type="text"
                            value={formData.cycleName}
                            onChange={(e) => setFormData({ ...formData, cycleName: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Participants</label>
                        <select
                            value={formData.participants}
                            onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option>All Employees</option>
                            <option>Specific Department</option>
                            <option>Leadership Only</option>
                        </select>
                    </div>
                    <div className="pt-4 flex gap-4">
                        <button onClick={() => router.back()} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                        <button
                            onClick={handleCreate}
                            disabled={submitting}
                            className="flex-1 py-3 rounded-xl bg-[#3b82f6] text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-colors disabled:opacity-70"
                        >
                            {submitting ? 'Launching...' : 'Launch Cycle'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
