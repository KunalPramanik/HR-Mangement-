'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [id, setId] = useState<string>('');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

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
                    toast.error('User not found');
                    router.push('/hr/employees');
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, router]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!user) return null;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'dashboard' },
        { id: 'personal', label: 'Personal', icon: 'person' },
        { id: 'job', label: 'Job & Role', icon: 'work' },
        { id: 'financial', label: 'Financial', icon: 'payments' },
        { id: 'education', label: 'Education', icon: 'school' },
        { id: 'documents', label: 'Documents', icon: 'folder' },
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="size-28 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-1">
                                <div className="size-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        <span className="text-4xl font-extrabold text-blue-600">{user.firstName[0]}{user.lastName[0]}</span>
                                    )}
                                </div>
                            </div>
                            <span className={`absolute bottom-1 right-2 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        </div>

                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2 text-sm">
                                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium border border-blue-100 dark:border-blue-800">
                                    {user.position}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                                    {user.department}
                                </span>
                                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-[16px]">id_card</span> {user.employeeId}
                                </span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
                                <a href={`mailto:${user.email}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">mail</span> {user.email}
                                </a>
                                <a href={`tel:${user.phoneNumber}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">call</span> {user.phoneNumber}
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push(`/hr/employees/${id}/edit`)}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">edit</span> Edit
                        </button>
                        <button
                            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-colors"
                            onClick={() => toast.info('Action menu coming soon')}
                        >
                            <span className="material-symbols-outlined text-[20px]">settings</span> Actions
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-1 mt-8 overflow-x-auto border-b border-slate-200 dark:border-slate-700 pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[18px] ${activeTab === tab.id ? 'fill-current' : ''}`}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6 animate-fadeIn">

                {/* --- OVERVIEW TAB --- */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <InfoCard label="Joined Date" value={new Date(user.dateOfJoining).toLocaleDateString()} icon="calendar_today" />
                                    <InfoCard label="Experience" value={user.workExperience || 'Fresh'} icon="history" />
                                    <InfoCard label="Reporting To" value={user.managerId ? `${user.managerId.firstName} ${user.managerId.lastName}` : 'None'} icon="supervisor_account" />
                                    <InfoCard label="Location" value={user.workLocation?.name || 'Remote'} icon="location_on" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Employment Timeline</h3>
                                <div className="space-y-4">
                                    {user.jobHistory?.length > 0 ? (
                                        user.jobHistory.map((h: any, i: number) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                    <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 mt-1"></div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{h.fieldChanged}</p>
                                                    <p className="text-xs text-slate-500">{new Date(h.changeDate).toDateString()}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-sm">No timeline events recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="material-symbols-outlined text-[80px]">badge</span>
                                </div>
                                <h3 className="font-bold text-lg mb-1">{user.firstName} {user.lastName}</h3>
                                <p className="text-slate-400 text-sm mb-6">{user.position}</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">ID No</span>
                                        <span className="font-mono">{user.employeeId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Blood Group</span>
                                        <span>{user.bloodGroup || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Emergency</span>
                                        <span>{user.emergencyContact?.phoneNumber || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Team Members</h3>
                                {user.directReports?.length > 0 ? (
                                    <div className="space-y-3">
                                        {user.directReports.map((r: any) => (
                                            <div key={r._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer" onClick={() => router.push(`/hr/employees/${r._id}`)}>
                                                <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-200 font-bold text-xs">{r.firstName[0]}</div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{r.firstName} {r.lastName}</p>
                                                    <p className="text-xs text-slate-500">{r.position}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No direct reports.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PERSONAL TAB --- */}
                {activeTab === 'personal' && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                        <SectionTitle title="Basic Information" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 mb-8">
                            <DetailItem label="Full Legal Name" value={`${user.firstName} ${user.lastName}`} />
                            <DetailItem label="Father's Name" value={user.fatherName} />
                            <DetailItem label="Mother's Name" value={user.motherName} />
                            <DetailItem label="Date of Birth" value={new Date(user.dateOfBirth).toLocaleDateString()} />
                            <DetailItem label="Gender" value={user.gender} />
                            <DetailItem label="Marital Status" value={user.maritalStatus} />
                            <DetailItem label="Nationality" value={user.nationality} />
                            <DetailItem label="Blood Group" value={user.bloodGroup} />
                        </div>

                        <SectionTitle title="Contact Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8">
                            <DetailItem label="Personal Email" value={user.personalEmail} />
                            <DetailItem label="Work Email" value={user.officialEmail || user.email} />
                            <DetailItem label="Mobile Number" value={user.phoneNumber} />
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <DetailItem label="Current Address" value={user.currentAddress} />
                                <DetailItem label="Permanent Address" value={user.permanentAddress} />
                            </div>
                        </div>

                        <SectionTitle title="Emergency Contact" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
                            <DetailItem label="Name" value={user.emergencyContact?.name} />
                            <DetailItem label="Relationship" value={user.emergencyContact?.relationship} />
                            <DetailItem label="Phone Number" value={user.emergencyContact?.phoneNumber} />
                        </div>
                    </div>
                )}

                {/* --- FINANCIAL TAB --- */}
                {activeTab === 'financial' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                            <SectionTitle title="Salary Structure" />
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Annual CTC</span>
                                    <span className="font-bold text-lg text-slate-900 dark:text-white">₹{Number(user.salaryInfo?.ctc).toLocaleString() || '0'}</span>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                                    <SalaryRow label="Basic Salary" value={user.salaryInfo?.basic} />
                                    <SalaryRow label="HRA" value={user.salaryInfo?.hra} />
                                    <SalaryRow label="Special Allowance" value={user.salaryInfo?.specialAllowance} />
                                    <SalaryRow label="PF (Employer)" value={user.salaryInfo?.pf} isDeduction />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                                <SectionTitle title="Bank Details" />
                                <div className="space-y-4">
                                    <DetailItem label="Bank Name" value={user.bankInfo?.bankName} />
                                    <DetailItem label="Account Number" value={user.bankInfo?.accountNumber} isSensitive />
                                    <DetailItem label="IFSC Code" value={user.bankInfo?.ifscCode} />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                                <SectionTitle title="Statutory Info" />
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="PAN Number" value={user.pan || user.statutoryInfo?.pan} />
                                    <DetailItem label="UAN" value={user.statutoryInfo?.uan} />
                                    <DetailItem label="PF Number" value={user.statutoryInfo?.pfNumber} />
                                    <DetailItem label="ESI Number" value={user.statutoryInfo?.esiNumber} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- JOB TAB --- */}
                {activeTab === 'job' && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                        <SectionTitle title="Employment Details" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <DetailItem label="Role" value={user.role} />
                            <DetailItem label="Employment Type" value={user.employeeType} />
                            <DetailItem label="Work Status" value={user.employmentStatus} />
                            <DetailItem label="Date of Joining" value={new Date(user.dateOfJoining).toLocaleDateString()} />
                            <DetailItem label="Probation Period" value={`${user.probationPeriod} months`} />
                        </div>

                        <SectionTitle title="Experience (Previous Employment)" />
                        <div className="space-y-4">
                            {user.previousEmployment?.length > 0 ? (
                                user.previousEmployment.map((exp: any, i: number) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                                        <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-300">business</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">{exp.designation}</h4>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{exp.companyName}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(exp.startDate).toLocaleDateString()} - {new Date(exp.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 italic">No previous experience records found.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* --- EDUCATION TAB --- */}
                {activeTab === 'education' && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                        <SectionTitle title="Education Qualifications" />
                        <div className="space-y-4">
                            {user.education?.length > 0 ? (
                                user.education.map((edu: any, i: number) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 items-center">
                                        <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">school</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">{edu.qualification}</h4>
                                            <p className="text-slate-700 dark:text-slate-300">{edu.institution}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 dark:text-white">{edu.yearOfPassing}</p>
                                            <p className="text-xs text-slate-500">Year of Passing</p>
                                        </div>
                                        <div className="text-right px-4 border-l border-slate-200 dark:border-slate-600">
                                            <p className="font-bold text-blue-600">{edu.grade}</p>
                                            <p className="text-xs text-slate-500">Grade/CGPA</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 italic">No education records found.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* --- DOCUMENTS TAB --- */}
                {activeTab === 'documents' && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                        <SectionTitle title="Uploaded Documents" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.documents?.length > 0 ? (
                                user.documents.map((doc: any, i: number) => (
                                    <div key={i} className="group relative p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md transition-all bg-slate-50 dark:bg-slate-700/30">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="size-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                                <span className="material-symbols-outlined">description</span>
                                            </div>
                                            <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">Verified</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white truncate" title={doc.name}>{doc.name}</h4>
                                        <p className="text-xs text-slate-500 mb-4">{doc.type}</p>

                                        <div className="flex gap-2">
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">visibility</span> View
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-10 text-center text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">folder_off</span>
                                    <p>No documents uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

// Helper Components
function InfoCard({ label, value, icon }: any) {
    return (
        <div className="flex items-start gap-3">
            <div className="text-slate-400 dark:text-slate-500">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-0.5">{label}</p>
                <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[120px]" title={value}>{value}</p>
            </div>
        </div>
    );
}

function DetailItem({ label, value, isSensitive }: any) {
    return (
        <div>
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">{label}</p>
            <p className={`font-medium text-slate-900 dark:text-white ${isSensitive ? 'font-mono' : ''}`}>
                {value || <span className="text-slate-300 italic">Not provided</span>}
            </p>
        </div>
    );
}

function SectionTitle({ title }: { title: string }) {
    return (
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
            {title}
        </h3>
    );
}

function SalaryRow({ label, value, isDeduction }: any) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 dark:text-slate-400">{label}</span>
            <span className={`font-mono font-medium ${isDeduction ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                {isDeduction ? '-' : ''}₹{Number(value).toLocaleString() || '0'}
            </span>
        </div>
    );
}
