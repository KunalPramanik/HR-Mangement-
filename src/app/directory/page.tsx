'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function DirectoryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setEmployees(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch users', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const role = (emp.position || emp.role || '').toLowerCase();
        const dept = (emp.department || '').toLowerCase();
        const term = searchTerm.toLowerCase();

        return fullName.includes(term) || role.includes(term) || dept.includes(term);
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Employee Directory</h1>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                    type="text"
                    placeholder="Search by name, role, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                />
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <span className="material-symbols-outlined animate-spin text-4xl mb-2 text-[#135bec]">progress_activity</span>
                    <p className="text-slate-500">Loading directory...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredEmployees.map(emp => (
                        <div key={emp._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="relative">
                                <div className="size-16 sm:size-14 rounded-full bg-gradient-to-br from-[#135bec] to-blue-600 flex items-center justify-center text-white text-2xl sm:text-xl font-bold shrink-0 uppercase">
                                    {emp.firstName ? emp.firstName[0] : ''}{emp.lastName ? emp.lastName[0] : ''}
                                </div>
                                <div className={`absolute bottom-0 right-0 size-3.5 sm:size-3 rounded-full border-2 border-white dark:border-slate-800 ${emp.isActive ? 'bg-green-500' : 'bg-slate-400'}`} title={emp.isActive ? 'Account Active' : 'Account Inactive'}></div>
                            </div>
                            <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-1 sm:mb-0">
                                    <div className="mb-2 sm:mb-0">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] mx-auto sm:mx-0">{emp.firstName} {emp.lastName}</h3>
                                        <p className="text-xs text-[#135bec] font-semibold mb-1 uppercase tracking-wide">{emp.position || emp.role}</p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${emp.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {emp.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate">{emp.department} • {emp.email}</p>

                                <div className="flex gap-2 justify-center sm:justify-start mt-2">
                                    <button onClick={() => window.location.href = `mailto:${emp.email}`} className="size-9 sm:size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#135bec] hover:text-white transition-colors" title={emp.email}>
                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                    </button>
                                    <button onClick={() => emp.phoneNumber ? window.location.href = `tel:${emp.phoneNumber}` : alert('No phone number')} className="size-9 sm:size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-green-500 hover:text-white transition-colors" title={emp.phoneNumber || 'No Phone'}>
                                        <span className="material-symbols-outlined text-[18px]">call</span>
                                    </button>
                                    <Link
                                        href={`/directory/${emp._id}`}
                                        className="size-9 sm:size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-purple-500 hover:text-white transition-colors"
                                        title="View Profile"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredEmployees.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                    <p>No employees found.</p>
                </div>
            )}
        </div>
    );
}
