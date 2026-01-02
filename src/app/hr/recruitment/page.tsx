'use client';

import { useState, useEffect } from 'react';

export default function RecruitmentPage() {
    const [activeTab, setActiveTab] = useState('jobs');
    const [jobs, setJobs] = useState<any[]>([]);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [showJobModal, setShowJobModal] = useState(false);

    // Create Job Form
    const [jobData, setJobData] = useState({
        title: '',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        description: '',
        requirements: ''
    });

    useEffect(() => {
        if (activeTab === 'jobs') fetchJobs();
        else fetchReferrals();
    }, [activeTab]);

    const fetchJobs = async () => {
        try {
            const res = await fetch('/api/jobs?includeDrafts=true');
            if (res.ok) setJobs(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchReferrals = async () => {
        try {
            const res = await fetch('/api/referrals');
            if (res.ok) setReferrals(await res.json());
        } catch (e) { console.error(e); }
    };

    const [editingId, setEditingId] = useState<string | null>(null);

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/jobs/${editingId}` : '/api/jobs';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...jobData,
                    requirements: Array.isArray(jobData.requirements) ? jobData.requirements : jobData.requirements.split('\n').filter((r: string) => r.trim())
                })
            });

            if (res.ok) {
                setShowJobModal(false);
                setEditingId(null);
                setJobData({ title: '', department: 'Engineering', location: 'Remote', type: 'Full-time', description: '', requirements: '' });
                fetchJobs();
            }
        } catch (e) { console.error(e); }
    };

    const handleEdit = (job: any) => {
        setEditingId(job._id);
        setJobData({
            title: job.title,
            department: job.department,
            location: job.location,
            type: job.type,
            description: job.description,
            requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements
        });
        setShowJobModal(true);
    };

    const handleCloseJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to close this position?')) return;
        try {
            const res = await fetch(`/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Closed' })
            });

            if (res.ok) fetchJobs();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Recruitment & Jobs</h1>
                    <p className="text-xs text-slate-500">Manage open positions and referrals</p>
                </div>
                {activeTab === 'jobs' && (
                    <button
                        onClick={() => { setEditingId(null); setJobData({ title: '', department: 'Engineering', location: 'Remote', type: 'Full-time', description: '', requirements: '' }); setShowJobModal(true); }}
                        className="bg-[#135bec] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span> Post Job
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl mb-6 w-fit">
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'jobs' ? 'bg-white dark:bg-slate-700 shadow-sm text-[#135bec]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Job Postings
                </button>
                <button
                    onClick={() => setActiveTab('referrals')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'referrals' ? 'bg-white dark:bg-slate-700 shadow-sm text-[#135bec]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Referrals ({referrals.length})
                </button>
            </div>

            {/* Content */}
            {activeTab === 'jobs' ? (
                <div className="grid grid-cols-1 gap-4">
                    {jobs.length === 0 && <div className="text-center p-8 text-slate-500">No jobs posted yet.</div>}
                    {jobs.map(job => (
                        <div key={job._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{job.title}</h3>
                                    <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded">{job.department}</span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded">{job.location}</span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded">{job.type}</span>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${job.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {job.status}
                                </span>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button onClick={() => handleEdit(job)} className="text-xs font-bold text-slate-500 hover:text-[#135bec]">Edit</button>
                                {job.status === 'Open' && (
                                    <button onClick={() => handleCloseJob(job._id)} className="text-xs font-bold text-slate-500 hover:text-red-500">Close</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {referrals.length === 0 && <div className="text-center p-8 text-slate-500">No referrals received yet.</div>}
                    {referrals.map(ref => (
                        <div key={ref._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{ref.candidateName}</h3>
                                <p className="text-xs text-slate-500 mb-1">{ref.candidateEmail} • {ref.candidatePhone}</p>
                                <p className="text-xs font-medium text-[#135bec]">Referred for: {ref.jobId?.title || 'Unknown Role'}</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Referred By</p>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{ref.referrerId?.firstName} {ref.referrerId?.lastName}</p>
                                {ref.resumeUrl && (
                                    <a href={ref.resumeUrl} target="_blank" className="mt-1 text-xs text-blue-600 hover:underline flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">attach_file</span> View Resume
                                    </a>
                                )}
                                <span className="inline-block mt-2 px-2 py-1 rounded-lg bg-orange-100 text-orange-700 text-[10px] font-bold uppercase">
                                    {ref.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Job Modal */}
            {showJobModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-xl animate-scale-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Job Position' : 'Post New Job'}</h3>
                            <button onClick={() => setShowJobModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateJob}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Job Title</label>
                                <input type="text" value={jobData.title} onChange={e => setJobData({ ...jobData, title: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" required />
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Department</label>
                                    <select value={jobData.department} onChange={e => setJobData({ ...jobData, department: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <option>Engineering</option>
                                        <option>Sales</option>
                                        <option>Marketing</option>
                                        <option>HR</option>
                                        <option>Finance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Location</label>
                                    <select value={jobData.location} onChange={e => setJobData({ ...jobData, location: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <option>Remote</option>
                                        <option>New York</option>
                                        <option>London</option>
                                        <option>Mumbai</option>
                                        <option>Delhi</option>
                                        <option>Hyderabad</option>
                                        <option>Bangalore</option>
                                        <option>Chennai</option>
                                        <option>Kolkata</option>
                                        <option>Pune</option>
                                        <option>Jaipur</option>
                                        <option>Visakhapatnam</option>
                                        <option>Surat</option>
                                        <option>Indore</option>
                                        <option>Patna</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                                    <select value={jobData.type} onChange={e => setJobData({ ...jobData, type: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                <textarea value={jobData.description} onChange={e => setJobData({ ...jobData, description: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 h-32" required></textarea>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Requirements (one per line)</label>
                                <textarea value={jobData.requirements} onChange={e => setJobData({ ...jobData, requirements: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 h-32" placeholder="- 5+ years experience..."></textarea>
                            </div>

                            <button type="submit" className="w-full bg-[#135bec] text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">{editingId ? 'Update Position' : 'Post Position'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
