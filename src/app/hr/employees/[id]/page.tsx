'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [id, setId] = useState<string>('');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const resolvedParams = await params;
            setId(resolvedParams.id);
        })();
    }, [params]);

    useEffect(() => {
        if (!id) return;
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/users/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    alert('User not found');
                    router.push('/hr/employees');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, router]);

    if (loading) return <div className="p-20 text-center text-gray-500 font-bold">Loading profile...</div>;
    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto py-8 px-6 min-h-screen">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                    <div className="size-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-1">
                        <div className="size-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-extrabold text-blue-600">{user.firstName[0]}{user.lastName[0]}</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#111827]">{user.firstName} {user.lastName}</h1>
                        <p className="text-gray-500 font-medium text-sm mt-1 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">badge</span> {user.position} • {user.department}
                        </p>
                        <p className="text-gray-400 text-xs mt-1 font-mono">{user.email} • ID: {user.employeeId}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push(`/hr/employees/${id}/edit`)} // Assume we'd build edit page too
                        className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 text-sm flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                    </button>
                    <button
                        className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 text-sm flex items-center gap-2"
                        onClick={() => alert('Suspend functionality integrated in list view')}
                    >
                        <span className="material-symbols-outlined text-[18px]">block</span> Suspend
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <div className="soft-card p-6">
                        <h3 className="text-lg font-bold text-[#111827] mb-4 border-b border-gray-100 pb-2">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Phone</p>
                                <p className="font-medium text-gray-700">{user.phoneNumber || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Status</p>
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Joining Date</p>
                                <p className="font-medium text-gray-700">{new Date(user.dateOfJoining).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Manager</p>
                                <p className="font-medium text-gray-700">{user.managerId?.firstName} {user.managerId?.lastName || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Role History (Advanced Feature) */}
                    <div className="soft-card p-6">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                            <h3 className="text-lg font-bold text-[#111827]">Role History</h3>
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">Advanced</span>
                        </div>

                        {user.jobHistory && user.jobHistory.length > 0 ? (
                            <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                {user.jobHistory.map((history: any, i: number) => (
                                    <div key={i} className="relative pl-10">
                                        <div className="absolute left-[9px] top-1 size-3.5 rounded-full border-2 border-white bg-blue-500 shadow-sm z-10"></div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs font-bold text-gray-500 mb-1">{new Date(history.changeDate).toLocaleDateString()}</p>
                                            <p className="text-sm font-bold text-[#111827]">Changed {history.fieldChanged}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs">
                                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded line-through">{String(history.oldValue)}</span>
                                                <span className="material-symbols-outlined text-[14px] text-gray-400">arrow_forward</span>
                                                <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold">{String(history.newValue)}</span>
                                            </div>
                                            {history.reason && <p className="text-xs text-gray-400 mt-2 italic">"{history.reason}"</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">No role changes recorded.</div>
                        )}
                    </div>
                </div>

                {/* Right Column: Encrypted Data & Assets */}
                <div className="space-y-6">
                    <div className="soft-card p-6 bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <span className="material-symbols-outlined text-[100px]">lock</span>
                        </div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-400">encrypted</span> Sensitive Data
                        </h3>
                        <div className="space-y-4 text-sm relative z-10">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Salary (CTC)</p>
                                <p className="font-mono text-yellow-400 font-bold">{user.salaryInfo?.ctc ? user.salaryInfo.ctc : '******'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Bank Account</p>
                                <p className="font-mono">{user.bankInfo?.accountNumber ? `****${user.bankInfo.accountNumber.slice(-4)}` : '******'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Aadhaar</p>
                                <p className="font-mono">{user.aadhaar ? `********${user.aadhaar.slice(-4)}` : '******'}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-6 text-center">
                            Only accessible by HR & authorized roles. <br /> Logged in Audit Trail.
                        </p>
                    </div>

                    <div className="soft-card p-6">
                        <h3 className="text-lg font-bold text-[#111827] mb-4">Direct Reports</h3>
                        {user.directReports && user.directReports.length > 0 ? (
                            <div className="space-y-3">
                                {user.directReports.map((rep: any) => (
                                    <div key={rep._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => router.push(`/hr/employees/${rep._id}`)}>
                                        <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-extrabold text-blue-600">
                                            {rep.firstName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#111827]">{rep.firstName} {rep.lastName}</p>
                                            <p className="text-xs text-gray-500">{rep.position}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-xs">No direct reports.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
