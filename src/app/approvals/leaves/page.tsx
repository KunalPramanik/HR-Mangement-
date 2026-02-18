'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type LeaveRequest = {
    _id: string;
    employeeId: {
        _id: string;
        firstName: string;
        lastName: string;
        position: string;
        department: string;
        profilePicture?: string;
    };
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: 'Pending';
};

export default function LeaveApprovalsPage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchApprovals = async () => {
        try {
            const res = await fetch('/api/leaves?view=approvals');
            if (res.ok) {
                const data = await res.json();
                setLeaves(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleAction = async (id: string, action: 'Approved' | 'Rejected') => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;

        try {
            const res = await fetch(`/api/leaves/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            });

            if (res.ok) {
                setLeaves(leaves.filter(l => l._id !== id));
                alert(`Leave request ${action.toLowerCase()} successfully.`);
            } else {
                alert('Action failed.');
            }
        } catch (error) {
            alert('Error processing request.');
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">Leave Approvals</h1>
                <p className="text-[#6b7280] font-medium">Review and manage team leave requests.</p>
            </div>

            {/* List */}
            <div className="soft-card p-0 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading requests...</div>
                ) : leaves.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No pending leave requests found.</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Leave Type</th>
                                <th className="px-6 py-4">Dates</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {leaves.map((leave) => (
                                <tr key={leave._id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                {leave.employeeId?.profilePicture ? (
                                                    <img src={leave.employeeId.profilePicture} alt="" className="size-full rounded-full object-cover" />
                                                ) : (
                                                    (leave.employeeId?.firstName?.[0] || 'U') + (leave.employeeId?.lastName?.[0] || '')
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#111827]">{leave.employeeId?.firstName} {leave.employeeId?.lastName}</div>
                                                <div className="text-xs text-gray-500">{leave.employeeId?.position}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700">{leave.leaveType}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="font-bold">{new Date(leave.startDate).toLocaleDateString()}</div>
                                        <div className="text-xs">to {new Date(leave.endDate).toLocaleDateString()}</div>
                                        <div className="text-xs text-blue-600 font-bold mt-1">({Math.ceil(leave.totalDays)} Days)</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={leave.reason}>
                                        {leave.reason || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleAction(leave._id, 'Approved')}
                                                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(leave._id, 'Rejected')}
                                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
