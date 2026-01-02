'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    position: string;
    profilePicture?: string;
    isActive: boolean;
    employmentStatus?: string;
}

export default function EmployeesListPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setUsers(data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        try {
            const isActive = newStatus === 'active' || newStatus === 'probation';
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employmentStatus: newStatus, isActive })
            });

            if (res.ok) {
                setUsers(prev => prev.map(u =>
                    u._id === userId ? { ...u, employmentStatus: newStatus, isActive } : u
                ));
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        }
    };

    const filteredUsers = users.filter(user => {
        if (filter === 'active') return user.isActive;
        if (filter === 'inactive') return !user.isActive;
        return true;
    });

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'probation': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'notice_period': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'resigned': return 'bg-slate-100 text-slate-500 border-slate-200';
            case 'terminated': return 'bg-red-100 text-red-700 border-red-200';
            case 'internship_completed': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Employees Directory</h1>
                        <p className="text-xs text-slate-500">Manage employment status and access</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    >
                        <option value="active">Active Employees</option>
                        <option value="inactive">Past / Inactive</option>
                        <option value="all">All Records</option>
                    </select>
                    <button
                        onClick={() => router.push('/hr/employees/add')}
                        className="bg-[#135bec] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        <span className="hidden md:inline">Add New</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#135bec]"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => (
                        <div
                            key={user._id}
                            style={{ zIndex: activeMenu === user._id ? 50 : 1 }}
                            className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 transition-all relative ${!user.isActive ? 'grayscale opacity-75' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile?email=${user.email}`)}>
                                    <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[#135bec] font-bold text-lg overflow-hidden shrink-0">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt="Pic" className="w-full h-full object-cover" />
                                        ) : (
                                            user.firstName[0]
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white break-words">{user.firstName} {user.lastName}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user.position}</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenu(activeMenu === user._id ? null : user._id);
                                        }}
                                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-200 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-slate-400">more_vert</span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {activeMenu === user._id && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10 cursor-default"
                                                onClick={() => setActiveMenu(null)}
                                            ></div>
                                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 animate-in fade-in zoom-in-95 duration-100">
                                                <div className="p-1">
                                                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Status</p>
                                                    <button onClick={() => { handleStatusChange(user._id, 'active'); setActiveMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-green-600 font-medium">Active</button>
                                                    <button onClick={() => { handleStatusChange(user._id, 'notice_period'); setActiveMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-orange-600 font-medium">Notice Period</button>
                                                    <button onClick={() => { handleStatusChange(user._id, 'resigned'); setActiveMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-slate-600 font-medium">Resigned</button>
                                                    <button onClick={() => { handleStatusChange(user._id, 'terminated'); setActiveMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-red-600 font-medium">Terminated</button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-bold uppercase">
                                    {user.department}
                                </span>
                                <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase border ${getStatusColor(user.employmentStatus || (user.isActive ? 'active' : 'resigned'))}`}>
                                    {user.employmentStatus?.replace('_', ' ') || (user.isActive ? 'Active' : 'Inactive')}
                                </span>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs text-slate-500">
                                <span>ID: {user.role === 'intern' ? 'INT' : 'EMP'}-{user._id.slice(-4)}</span>
                                <button className="font-bold text-[#135bec] hover:underline" onClick={() => router.push(`/profile?email=${user.email}`)}>View Details</button>
                            </div>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="col-span-full py-10 text-center text-slate-500">
                            No employees found for this filter.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
