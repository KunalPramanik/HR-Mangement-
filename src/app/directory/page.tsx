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

    // Mock Data if API fails or for premium feel
    const mockEmployees = [
        { _id: '1', firstName: 'Sarah', lastName: 'Jenkins', role: 'Product Manager', department: 'Product', email: 'sarah.j@company.com', isActive: true },
        { _id: '2', firstName: 'Marco', lastName: 'Rossi', role: 'UI/UX Designer', department: 'Creative', email: 'marco.r@company.com', isActive: true },
        { _id: '3', firstName: 'James', lastName: 'Wilson', role: 'Backend Lead', department: 'Engineering', email: 'j.wilson@company.com', isActive: true },
        { _id: '4', firstName: 'Elena', lastName: 'Rodriguez', role: 'HR Manager', department: 'Operations', email: 'elena.r@company.com', isActive: false },
        { _id: '5', firstName: 'David', lastName: 'Chen', role: 'Frontend Dev', department: 'Engineering', email: 'david.c@company.com', isActive: true },
    ];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Attempt fetch, fallback to mock
                setTimeout(() => {
                    setEmployees(mockEmployees);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error('Failed to fetch users', error);
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
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
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
                        <p className="text-[#6b7280] font-medium">Connect with your colleagues across the organization.</p>
                    </div>
                </div>
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
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="soft-card h-64 animate-pulse bg-gray-100"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEmployees.map(emp => (
                        <div key={emp._id} className="soft-card p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 relative group">
                            <div className="relative mb-4">
                                <div className="size-20 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
                                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-white flex items-center justify-center ${emp.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                                    {emp.isActive && <span className="material-symbols-outlined text-[10px] text-white">check</span>}
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-[#111827] mb-1">{emp.firstName} {emp.lastName}</h3>
                            <p className="text-xs font-bold text-[#3b82f6] uppercase tracking-wider mb-4">{emp.role}</p>

                            <div className="w-full pt-4 border-t border-gray-100 flex justify-center gap-4">
                                <button className="size-10 rounded-full bg-blue-50 text-[#3b82f6] flex items-center justify-center hover:bg-blue-100 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">mail</span>
                                </button>
                                <button className="size-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">call</span>
                                </button>
                                <Link href={`/profile/${emp._id}`} className="size-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
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
