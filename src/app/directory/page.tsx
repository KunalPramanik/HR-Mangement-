'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function DirectoryPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                if (!res.ok) {
                    if (res.status === 403) {
                        toast.error('You do not have permission to view the full directory.');
                        return;
                    }
                    throw new Error('Failed to fetch users');
                }
                const data = await res.json();

                if (Array.isArray(data)) {
                    setEmployees(data);
                } else if (data.users && Array.isArray(data.users)) {
                    setEmployees(data.users);
                }
            } catch (error) {
                console.error('Failed to fetch users', error);
                toast.error('Could not load directory');
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchUsers();
        }
    }, [session]);

    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const role = (emp.designation || emp.position || emp.role || '').toLowerCase();
        const dept = (emp.department || '').toLowerCase();
        const term = searchTerm.toLowerCase();

        return fullName.includes(term) || role.includes(term) || dept.includes(term);
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
        setActiveMenu(null);
    };

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen" onClick={() => setActiveMenu(null)}>
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="size-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-600">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">People Directory</h1>
                        <p className="text-[#6b7280] font-medium">Connect with your colleagues across {session?.user?.department || 'the organization'}.</p>
                    </div>
                </div>

                {['hr', 'admin', 'director', 'vp', 'cxo', 'cho'].includes(session?.user?.role || '') && (
                    <Link href="/hr/employees/add" className="px-6 py-3 rounded-full bg-[#3b82f6] text-white font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:bg-[#2563eb] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        New Employee
                    </Link>
                )}
            </div>

            {/* Search */}
            <div className="relative max-w-2xl">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <span className="material-symbols-outlined">search</span>
                </div>
                <input
                    type="text"
                    placeholder="Search by name, role, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl border-none bg-white shadow-soft text-[#111827] font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-[#3b82f6] outline-none transition-all"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="soft-card h-64 animate-pulse bg-gray-100 flex flex-col items-center justify-center gap-4">
                            <div className="size-20 rounded-full bg-gray-200"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEmployees.map(emp => (
                        <div key={emp._id} className="soft-card p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 relative group border border-transparent hover:border-blue-100">

                            {/* Three Dots Menu */}
                            <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => setActiveMenu(activeMenu === emp._id ? null : emp._id)}
                                    className="size-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                </button>

                                {activeMenu === emp._id && (
                                    <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 w-48 py-2 z-20 animate-fadeIn">
                                        <button
                                            onClick={() => router.push(`/profile/${emp._id}`)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            View Profile
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(emp.email)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                            Copy Email
                                        </button>
                                        <button
                                            onClick={() => router.push(`/hr/org-chart?focus=${emp._id}`)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">account_tree</span>
                                            Show in Org Chart
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative mb-4">
                                {emp.profilePicture ? (
                                    <img src={emp.profilePicture} alt={emp.firstName} className="size-20 rounded-2xl object-cover shadow-lg shadow-blue-500/20" />
                                ) : (
                                    <div className="size-20 rounded-2xl bg-linear-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
                                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                                    </div>
                                )}

                                <div className={`absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-white flex items-center justify-center ${emp.isActive ? 'bg-green-500' : 'bg-gray-400'}`} title={emp.isActive ? 'Active' : 'Inactive'}>
                                    {emp.isActive && <span className="material-symbols-outlined text-[10px] text-white">check</span>}
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-[#111827] mb-0.5">{emp.firstName} {emp.lastName}</h3>
                            <p className="text-xs font-bold text-[#3b82f6] uppercase tracking-wider mb-1">{emp.designation || emp.role}</p>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{emp.department}</span>

                            <div className="w-full pt-4 mt-4 border-t border-gray-100 flex justify-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                <a href={`mailto:${emp.email}`} className="size-9 rounded-full bg-blue-50 text-[#3b82f6] flex items-center justify-center hover:bg-blue-100 transition-colors" title="Email">
                                    <span className="material-symbols-outlined text-[18px]">mail</span>
                                </a>
                                {emp.phoneNumber && (
                                    <a href={`tel:${emp.phoneNumber}`} className="size-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors" title="Call">
                                        <span className="material-symbols-outlined text-[18px]">call</span>
                                    </a>
                                )}
                                <Link href={`/profile/${emp._id}`} className="size-9 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition-colors" title="View Profile">
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    ))}

                    {filteredEmployees.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="inline-flex p-6 rounded-full bg-gray-100 mb-4 text-gray-400">
                                <span className="material-symbols-outlined text-4xl">person_off</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No employees found</h3>
                            <p className="text-gray-500">Try adjusting your search terms.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
