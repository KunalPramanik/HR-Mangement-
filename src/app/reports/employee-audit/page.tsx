'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface EmployeeAuditRecord {
    _id: string;
    employee: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        employeeId: string;
        position: string;
        department: string;
        dateOfJoining: string;
        phoneNumber?: string;
        salary?: number;
        status: string;
    };
    addedBy: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
    addedAt: string;
    lastModifiedBy?: {
        firstName: string;
        lastName: string;
    };
    lastModifiedAt?: string;
}

export default function EmployeeAuditReportPage() {
    const { data: session } = useSession();
    const [records, setRecords] = useState<EmployeeAuditRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        department: '',
        addedBy: '',
        dateFrom: '',
        dateTo: '',
        search: ''
    });

    // Check user permissions
    const isAdmin = session?.user?.role === 'admin';
    const isHR = session?.user?.role === 'hr';
    const isManager = session?.user?.role === 'manager';
    const isSuperAdmin = session?.user?.role === 'superadmin';

    // Full access for admin, HR, superadmin, manager
    const hasFullAccess = isAdmin || isHR || isSuperAdmin || isManager;

    useEffect(() => {
        fetchAuditRecords();
    }, []);

    const fetchAuditRecords = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.department) queryParams.append('department', filters.department);
            if (filters.addedBy) queryParams.append('addedBy', filters.addedBy);
            if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
            if (filters.search) queryParams.append('search', filters.search);

            const res = await fetch(`/api/reports/employee-audit?${queryParams}`);
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
            } else {
                toast.error('Failed to load audit records');
            }
        } catch (error) {
            console.error('Error fetching audit records:', error);
            toast.error('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        setLoading(true);
        fetchAuditRecords();
    };

    const handleReset = () => {
        setFilters({
            department: '',
            addedBy: '',
            dateFrom: '',
            dateTo: '',
            search: ''
        });
        setLoading(true);
        fetchAuditRecords();
    };

    const exportToCSV = () => {
        const headers = hasFullAccess
            ? ['Employee ID', 'Name', 'Email', 'Position', 'Department', 'Salary', 'Phone', 'Date Joined', 'Added By', 'Added On', 'Status']
            : ['Employee ID', 'Name', 'Position', 'Department', 'Date Joined', 'Status'];

        const rows = records.map(record => {
            const baseData = [
                record.employee.employeeId,
                `${record.employee.firstName} ${record.employee.lastName}`,
                hasFullAccess ? record.employee.email : '',
                record.employee.position,
                record.employee.department,
                hasFullAccess ? (record.employee.salary || 'N/A') : '',
                hasFullAccess ? (record.employee.phoneNumber || 'N/A') : '',
                new Date(record.employee.dateOfJoining).toLocaleDateString(),
                hasFullAccess ? `${record.addedBy.firstName} ${record.addedBy.lastName} (${record.addedBy.role})` : '',
                hasFullAccess ? new Date(record.addedAt).toLocaleString() : '',
                record.employee.status
            ].filter(item => item !== '');

            return baseData;
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employee-audit-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Report exported successfully');
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <div className="inline-block size-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">Loading audit records...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[#111827] mb-2">Employee Audit Report</h1>
                <p className="text-gray-600">Track who added new employees and view detailed information</p>
                {!hasFullAccess && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <p className="text-sm text-yellow-800 font-medium">
                            ⚠️ Limited Access: You can only view basic employee information. Full details are available to HR, Managers, and Admins.
                        </p>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Name, Email, ID..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Department</label>
                        <select
                            value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">All Departments</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Design">Design</option>
                            <option value="Product">Product</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">From Date</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">To Date</label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <button
                            onClick={handleFilter}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                        >
                            Apply
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium opacity-90">Total Employees</span>
                        <span className="material-symbols-outlined">group</span>
                    </div>
                    <p className="text-3xl font-bold">{records.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium opacity-90">Active</span>
                        <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <p className="text-3xl font-bold">
                        {records.filter(r => r.employee.status === 'Active').length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium opacity-90">This Month</span>
                        <span className="material-symbols-outlined">calendar_today</span>
                    </div>
                    <p className="text-3xl font-bold">
                        {records.filter(r => {
                            const joinDate = new Date(r.employee.dateOfJoining);
                            const now = new Date();
                            return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                        }).length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium opacity-90">Departments</span>
                        <span className="material-symbols-outlined">corporate_fare</span>
                    </div>
                    <p className="text-3xl font-bold">
                        {new Set(records.map(r => r.employee.department)).size}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-bold text-gray-900">{records.length}</span> records
                </p>
                <button
                    onClick={exportToCSV}
                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/30 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">download</span>
                    Export to CSV
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Position</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Department</th>
                                {hasFullAccess && (
                                    <>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Salary</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Added By</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Added On</th>
                                    </>
                                )}
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan={hasFullAccess ? 9 : 5} className="px-6 py-12 text-center">
                                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">inbox</span>
                                        <p className="text-gray-500 font-medium">No records found</p>
                                        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                    {record.employee.firstName[0]}{record.employee.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">
                                                        {record.employee.firstName} {record.employee.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{record.employee.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{record.employee.position}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                                                {record.employee.department}
                                            </span>
                                        </td>
                                        {hasFullAccess && (
                                            <>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600">{record.employee.email}</p>
                                                    <p className="text-xs text-gray-500">{record.employee.phoneNumber || 'N/A'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900">
                                                        {record.employee.salary ? `₹${record.employee.salary.toLocaleString()}` : 'N/A'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {record.addedBy.firstName} {record.addedBy.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 capitalize">{record.addedBy.role}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(record.addedAt).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(record.addedAt).toLocaleTimeString()}
                                                    </p>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">
                                                {new Date(record.employee.dateOfJoining).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.employee.status === 'Active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {record.employee.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
