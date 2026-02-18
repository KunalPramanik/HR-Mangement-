'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EmployeeConnectPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (deptFilter) params.append('department', deptFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter); // Assuming API supports status filtering
            // Note: My GET /api/users currently filters by 'search', 'department', 'role'. 
            // I should update it to support 'status' or filter client side if small list.
            // Let's assume client side filter for now if API doesn't fully support it or just rely on search.

            const res = await fetch(`/api/users?view=admin&${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEmployees();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, deptFilter, statusFilter]);

    const handleSuspend = async (id: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this employee?`)) return;
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                // Optimistic update
                setEmployees(prev => prev.map(e => e._id === id ? { ...e, isActive: !currentStatus } : e));
            } else {
                alert('Action failed');
            }
        } catch (e) {
            alert('Error');
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] mb-2 tracking-tight">People & Culture</h1>
                    <p className="text-[#6b7280] font-medium">Manage your organization's talent pool.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push('/hr/org-chart')}
                        className="px-6 py-3 rounded-xl border-2 border-gray-100 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Org Chart
                    </button>
                    <Link
                        href="/onboarding/new"
                        className="px-6 py-3 rounded-xl bg-[#3b82f6] text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        Add Employee
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2 border border-transparent focus-within:border-blue-500 transition-colors">
                    <span className="material-symbols-outlined text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        className="bg-transparent border-none outline-none text-sm w-full font-medium text-[#111827] placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-sm text-gray-600 outline-none focus:border-blue-500"
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                >
                    <option value="">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                </select>

                <select
                    className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 font-bold text-sm text-gray-600 outline-none focus:border-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400 font-medium">Loading employees...</div>
                    ) : employees.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 font-medium">No employees found.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Role & Dept</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joining Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {employees.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center font-bold text-blue-600 text-sm overflow-hidden">
                                                    {emp.profilePicture ? (
                                                        <img src={emp.profilePicture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        `${emp.firstName[0]}${emp.lastName[0]}`
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#111827]">{emp.firstName} {emp.lastName}</div>
                                                    <div className="text-xs text-gray-500">{emp.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-700 text-sm">{emp.position}</div>
                                            <div className="text-xs text-gray-400 font-medium">{emp.department}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${emp.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                <div className={`size-1.5 rounded-full ${emp.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                {emp.isActive ? 'Active' : 'Suspended'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                            {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                                <button
                                                    onClick={() => router.push(`/hr/employees/${emp._id}`)}
                                                    className="size-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                    title="View Profile"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => handleSuspend(emp._id, emp.isActive)}
                                                    className={`size-8 rounded-lg flex items-center justify-center transition-colors ${emp.isActive ? 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600' : 'bg-green-50 text-green-600'
                                                        }`}
                                                    title={emp.isActive ? "Suspend" : "Activate"}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">{emp.isActive ? 'block' : 'check_circle'}</span>
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
        </div>
    );
}
