'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Job {
    _id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    status: string;
}

export default function CareersPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [referModal, setReferModal] = useState<{ open: boolean; job: Job | null }>({ open: false, job: null });

    // Refer Form Data
    const [referData, setReferData] = useState({
        candidateName: '',
        candidateEmail: '',
        candidatePhone: '',
        relationship: 'Former Colleague',
        resumeUrl: '', // Mock upload for now
        notes: ''
    });

    const { data: session } = useSession();

    useEffect(() => {
        fetchJobs();
    }, []);

    if (session?.user?.role === 'intern') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-orange-100 text-orange-600 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-5xl">lock_person</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h1>
                    <p className="text-slate-500 mb-6">The Careers & Referral portal is available to full-time employees only.</p>
                    <Link href="/dashboard" className="bg-[#135bec] text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const fetchJobs = async () => {
        try {
            const res = await fetch('/api/jobs');
            if (res.ok) setJobs(await res.json());
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', e.target.files[0]);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setReferData({ ...referData, resumeUrl: data.url });
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error('Upload error', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleRefer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/referrals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...referData,
                    jobId: referModal.job?._id
                })
            });

            if (res.ok) {
                alert('Referral submitted successfully! You can track status in your profile.');
                setReferModal({ open: false, job: null });
                setReferData({ candidateName: '', candidateEmail: '', candidatePhone: '', relationship: 'Former Colleague', resumeUrl: '', notes: '' });
            } else {
                alert('Failed to submit referral');
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Header */}
            <div className="bg-[#135bec] pt-12 pb-16 px-4 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Internal Job Board</h1>
                <p className="text-blue-200">Help us grow! Refer amazing talent and earn bonuses.</p>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8">
                {/* Job List */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Open Positions</h2>
                        <span className="bg-blue-100 text-[#135bec] px-3 py-1 rounded-full text-xs font-bold">{jobs.length} Active</span>
                    </div>

                    {loading ? (
                        <div className="p-10 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#135bec]"></div>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">
                            No open positions at the moment. Check back later!
                        </div>
                    ) : (
                        <div>
                            {jobs.map(job => (
                                <div key={job._id} className="p-6 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-[#135bec]">{job.title}</h3>
                                            <div className="flex gap-3 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">business</span> {job.department}</span>
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {job.location}</span>
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {job.type}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setReferModal({ open: true, job })}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">person_add</span> Refer Friend
                                        </button>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">{job.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Refer Modal */}
            {referModal.open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-xl animate-scale-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Refer a Candidate</h3>
                                <p className="text-xs text-slate-500">For: <span className="font-bold">{referModal.job?.title}</span></p>
                            </div>
                            <button onClick={() => setReferModal({ open: false, job: null })} className="p-2 hover:bg-slate-100 rounded-full">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleRefer}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Candidate Name</label>
                                <input
                                    type="text"
                                    value={referData.candidateName}
                                    onChange={e => setReferData({ ...referData, candidateName: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={referData.candidateEmail}
                                        onChange={e => setReferData({ ...referData, candidateEmail: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={referData.candidatePhone}
                                        onChange={e => setReferData({ ...referData, candidatePhone: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Relationship</label>
                                <select
                                    value={referData.relationship}
                                    onChange={e => setReferData({ ...referData, relationship: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                >
                                    <option>Former Colleague</option>
                                    <option>Friend</option>
                                    <option>Relative</option>
                                    <option>Professional Network</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Resume / CV</label>
                                <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 bg-slate-50 dark:bg-slate-700/50 text-center">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="w-full text-slate-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#135bec] file:text-white hover:file:bg-blue-700"
                                        accept=".pdf,.doc,.docx"
                                    />
                                    {uploading && <p className="text-xs text-blue-500 mt-2">Uploading...</p>}
                                    {referData.resumeUrl && <p className="text-xs text-green-500 mt-2 flex items-center justify-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Attached</p>}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Why are they a good fit?</label>
                                <textarea
                                    value={referData.notes}
                                    onChange={e => setReferData({ ...referData, notes: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl h-24"
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full bg-[#135bec] text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                                Submit Referral
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
