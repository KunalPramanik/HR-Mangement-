'use client';

import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.email) {
            // Check if URL has query param for email, otherwise use session
            const params = new URLSearchParams(window.location.search);
            const emailParam = params.get('email');

            fetch(`/api/users?email=${emailParam || session.user.email}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) setUser(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [session]);

    if (!session && !loading) return null;

    // Fallback to session if API fails or while loading
    const displayUser = user || {
        firstName: session?.user?.name?.split(' ')[0],
        lastName: session?.user?.name?.split(' ')[1],
        email: session?.user?.email,
        ...session?.user
    };

    const fullName = user ? `${user.firstName} ${user.lastName}` : session?.user?.name;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            {/* Header / Cover */}
            <div className="h-48 relative bg-slate-200 dark:bg-slate-800 overflow-hidden">
                {displayUser.coverPhoto ? (
                    <img src={displayUser.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#135bec] to-blue-600"></div>
                )}

                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                </div>

                <div className="absolute top-4 right-4 z-10">
                    {session?.user?.email === displayUser.email && (
                        <button
                            onClick={() => router.push(`/profile/edit?email=${displayUser.email}`)}
                            className="px-4 py-2 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-colors text-sm font-bold flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="px-4 -mt-16 relative z-0">
                <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <div className="size-32 rounded-full ring-4 ring-white dark:ring-slate-900 bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-4xl font-bold text-[#135bec] overflow-hidden">
                        {displayUser.profilePicture ? (
                            <img src={displayUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="bg-gradient-to-br from-[#135bec] to-blue-600 w-full h-full flex items-center justify-center text-white">
                                {fullName?.[0] || 'U'}
                            </div>
                        )}
                    </div>

                    <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white text-center">{fullName}</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-center">{displayUser.position} • {displayUser.department}</p>
                    <div className="mt-2 text-xs font-mono bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300">
                        ID: {displayUser.employeeId}
                    </div>
                </div>

                {/* Info Cards */}
                <div className="mt-8 flex flex-col gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider">Contact Information</h3>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-lg bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-[#135bec]">
                                    <span className="material-symbols-outlined">mail</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Email Address</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white break-all">{displayUser.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-lg bg-green-50 dark:bg-slate-700 flex items-center justify-center text-green-600">
                                    <span className="material-symbols-outlined">call</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{displayUser.phoneNumber || 'Not Set'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-lg bg-orange-50 dark:bg-slate-700 flex items-center justify-center text-orange-600">
                                    <span className="material-symbols-outlined">location_on</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{displayUser.address || 'Not Set'}</p>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            {displayUser.emergencyContact?.name && (
                                <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <div className="size-10 rounded-lg bg-red-50 dark:bg-slate-700 flex items-center justify-center text-red-600">
                                        <span className="material-symbols-outlined">emergency</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Emergency Contact</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{displayUser.emergencyContact.name} ({displayUser.emergencyContact.relationship})</p>
                                        <p className="text-xs text-slate-500">{displayUser.emergencyContact.phoneNumber}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Google Map Integration */}
                    {displayUser.address && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                            <iframe
                                width="100%"
                                height="250"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                src={`https://www.google.com/maps?q=${encodeURIComponent(displayUser.address)}&output=embed`}
                            >
                            </iframe>
                        </div>
                    )}

                    {/* Skills & Certifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Skills */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-500">school</span>
                                Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {displayUser.skills && displayUser.skills.length > 0 ? (
                                    displayUser.skills.map((skill: string, idx: number) => (
                                        <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm font-medium border border-green-100 dark:border-green-800">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-sm italic">No skills listed.</p>
                                )}
                            </div>
                        </div>

                        {/* Certifications */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-500">workspace_premium</span>
                                Certifications
                            </h3>
                            <div className="space-y-3">
                                {displayUser.certifications && displayUser.certifications.length > 0 ? (
                                    displayUser.certifications.map((cert: any, idx: number) => (
                                        <div key={idx} className="flex items-start gap-3 p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                            <span className="material-symbols-outlined text-purple-600 mt-1">verified</span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{cert.name}</p>
                                                <p className="text-xs text-slate-500">{cert.issuer} • {cert.date ? new Date(cert.date).toLocaleDateString() : ''}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-sm italic">No certifications listed.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reporting Hierarchy */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider">Reporting Hierarchy</h3>

                        {/* Reports To */}
                        <div className="mb-6">
                            <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Reports To</p>
                            {displayUser.managerId ? (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-[#135bec] font-bold">
                                        {displayUser.managerId.firstName?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{displayUser.managerId.firstName} {displayUser.managerId.lastName}</p>
                                        <p className="text-xs text-slate-500">{displayUser.managerId.position}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No Manager Assigned (Top Level)</p>
                            )}
                        </div>

                        {/* Direct Reports */}
                        {displayUser.directReports && displayUser.directReports.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Direct Reports ({displayUser.directReports.length})</p>
                                <div className="flex flex-col gap-2">
                                    {displayUser.directReports.map((report: any) => (
                                        <div key={report._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer" onClick={() => {
                                            router.push(`/profile?email=${report.email}`);
                                        }}>
                                            <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs ring-2 ring-white dark:ring-slate-700 overflow-hidden">
                                                {report.profilePicture ? (
                                                    <img src={report.profilePicture} className="w-full h-full object-cover" />
                                                ) : (
                                                    report.firstName?.[0]
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{report.firstName} {report.lastName}</p>
                                                <p className="text-[10px] text-slate-500">{report.position}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Leave Balance Editor (HR/Admin Only) */}
                    {(session?.user?.role === 'hr' || session?.user?.role === 'admin') && displayUser.leaveBalance && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-l-purple-500">
                            <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined">edit_square</span>
                                Adjustment (Admin Only)
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Annual Balance</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const newBal = (displayUser.leaveBalance.annual || 0) - 1;
                                                fetch(`/api/users/${displayUser._id}`, {
                                                    method: 'PUT',
                                                    body: JSON.stringify({ leaveBalance: { ...displayUser.leaveBalance, annual: newBal } })
                                                }).then(() => { setUser((prev: any) => ({ ...prev, leaveBalance: { ...prev.leaveBalance, annual: newBal } })) });
                                            }}
                                            className="size-6 bg-red-100 text-red-600 rounded flex items-center justify-center font-bold hover:bg-red-200"
                                        >-</button>
                                        <span className="font-bold text-lg w-8 text-center">{displayUser.leaveBalance.annual}</span>
                                        <button
                                            onClick={() => {
                                                const newBal = (displayUser.leaveBalance.annual || 0) + 1;
                                                fetch(`/api/users/${displayUser._id}`, {
                                                    method: 'PUT',
                                                    body: JSON.stringify({ leaveBalance: { ...displayUser.leaveBalance, annual: newBal } })
                                                }).then(() => { setUser((prev: any) => ({ ...prev, leaveBalance: { ...prev.leaveBalance, annual: newBal } })) });
                                            }}
                                            className="size-6 bg-green-100 text-green-600 rounded flex items-center justify-center font-bold hover:bg-green-200"
                                        >+</button>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Sick Balance</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const newBal = (displayUser.leaveBalance.sick || 0) - 1;
                                                fetch(`/api/users/${displayUser._id}`, {
                                                    method: 'PUT',
                                                    body: JSON.stringify({ leaveBalance: { ...displayUser.leaveBalance, sick: newBal } })
                                                }).then(() => { setUser((prev: any) => ({ ...prev, leaveBalance: { ...prev.leaveBalance, sick: newBal } })) });
                                            }}
                                            className="size-6 bg-red-100 text-red-600 rounded flex items-center justify-center font-bold hover:bg-red-200"
                                        >-</button>
                                        <span className="font-bold text-lg w-8 text-center">{displayUser.leaveBalance.sick}</span>
                                        <button
                                            onClick={() => {
                                                const newBal = (displayUser.leaveBalance.sick || 0) + 1;
                                                fetch(`/api/users/${displayUser._id}`, {
                                                    method: 'PUT',
                                                    body: JSON.stringify({ leaveBalance: { ...displayUser.leaveBalance, sick: newBal } })
                                                }).then(() => { setUser((prev: any) => ({ ...prev, leaveBalance: { ...prev.leaveBalance, sick: newBal } })) });
                                            }}
                                            className="size-6 bg-green-100 text-green-600 rounded flex items-center justify-center font-bold hover:bg-green-200"
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider">Account Settings</h3>

                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span className="font-semibold">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
