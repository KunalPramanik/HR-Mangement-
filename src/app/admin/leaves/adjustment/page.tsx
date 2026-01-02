'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeaveAdjustmentPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        targetUserId: '',
        leaveType: 'annual',
        adjustmentDays: 0,
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch simple list of users
                // In real app, this might be paginated or searched
                const res = await fetch('/api/users?simple=true');
                if (res.ok) {
                    const data = await res.json();
                    // Filter based on requirement: "all, hr, admin, intern, etc"
                    // User requested "no need employee only role based fixed this"
                    // Assuming we want to show ALL non-employee? Or just be able to select anyone except 'employee' role?
                    // "only role based fixed this like example: all,hr,admin,inten,,etc"
                    // Interpretation: The selector should allow selecting users of specific roles.
                    // Let's show ALL users but display their role so Admin knows who they are picking.
                    setUsers(data.users || []);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/leaves/adjust', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMessage('Request submitted! Waiting for CHO approval.');
                setFormData({ ...formData, adjustmentDays: 0, reason: '' });
            } else {
                const err = await res.json();
                setMessage('Error: ' + err.error);
            }
        } catch (error) {
            setMessage('Network Error');
        }
        setLoading(false);
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Request Leave Balance Adjustment</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                <div>
                    <label className="block text-sm font-medium mb-1">Target User</label>
                    <select
                        required
                        className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        value={formData.targetUserId}
                        onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
                    >
                        <option value="">-- Select User --</option>
                        {users.map(u => (
                            <option key={u._id} value={u._id}>
                                {u.firstName} {u.lastName} ({u.role?.toUpperCase()})
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Select the user to adjust balance for.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Leave Type</label>
                    <select
                        className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        value={formData.leaveType}
                        onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    >
                        <option value="annual">Annual Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="personal">Personal Leave</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Adjustment Days (+/-)</label>
                    <input
                        type="number"
                        required
                        className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        value={formData.adjustmentDays}
                        onChange={(e) => setFormData({ ...formData, adjustmentDays: Number(e.target.value) })}
                    />
                    <p className="text-xs text-slate-500">Positive to add, Negative to deduct.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Reason</label>
                    <textarea
                        required
                        className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    ></textarea>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {message}
                    </div>
                )}

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Request'}
                </button>
            </form>
        </div>
    );
}
