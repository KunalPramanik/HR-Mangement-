'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function RecruitmentPage() {
    const [showJobModal, setShowJobModal] = useState(false);
    const [showCandidateModal, setShowCandidateModal] = useState(false);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [jobs, setJobs] = useState<any[]>([]);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);

    const [jobData, setJobData] = useState({
        title: '',
        department: '',
        location: '',
        type: 'Full-time',
        description: ''
    });

    const [candidateData, setCandidateData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobId: '',
        stage: 'Sourced'
    });

    const [interviewData, setInterviewData] = useState({
        date: '',
        time: '',
        interviewer: '',
        link: ''
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        fetchCandidates();
    }, [selectedJobId]);

    const fetchJobs = async () => {
        try {
            const res = await fetch('/api/jobs');
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCandidates = async () => {
        try {
            setIsLoading(true);
            const url = selectedJobId === 'all' ? '/api/candidates' : `/api/candidates?jobId=${selectedJobId}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setCandidates(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostJob = async () => {
        if (!jobData.title || !jobData.department) {
            toast.error('Please fill in required fields');
            return;
        }

        try {
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to post job');
            }

            toast.success('Job posted successfully!');
            setShowJobModal(false);
            setJobData({ title: '', department: '', location: '', type: 'Full-time', description: '' });
            fetchJobs(); // Refresh list
        } catch (error) {
            toast.error('Failed to post job');
        }
    };

    const handleAddCandidate = async () => {
        if (!candidateData.firstName || !candidateData.email || !candidateData.jobId) {
            toast.error('Please fill in required fields');
            return;
        }

        try {
            const response = await fetch('/api/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(candidateData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add candidate');
            }

            toast.success('Candidate added successfully!');
            setShowCandidateModal(false);
            setCandidateData({ firstName: '', lastName: '', email: '', phone: '', jobId: '', stage: 'Sourced' });
            fetchCandidates(); // Refresh list
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to add candidate');
        }
    };

    const openInterview = (candidate: any) => {
        setSelectedCandidate(candidate);
        setInterviewData({ date: '', time: '', interviewer: '', link: '' });
        setShowInterviewModal(true);
    };

    const handleScheduleInterview = async () => {
        // Logic to send invite (Simulated)
        // Also update candidate stage to 'Interviewing'
        try {
            await fetch('/api/candidates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedCandidate._id,
                    stage: 'Interviewing'
                })
            });

            toast.success(`Interview scheduled for ${selectedCandidate.firstName}`);
            setShowInterviewModal(false);
            fetchCandidates();
        } catch (error) {
            toast.error('Failed to schedule interview');
        }
    };

    const stages = ['Sourced', 'Screening', 'Interviewing', 'Offer', 'Hired', 'Rejected'];

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] mb-2">Recruitment Pipeline</h1>
                    <div className="flex items-center gap-4">
                        <p className="text-[#6b7280] font-medium">Manage job postings and candidate applications.</p>
                        <select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="all">All Active Jobs</option>
                            {jobs.map(job => (
                                <option key={job._id} value={job._id}>{job.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCandidateModal(true)}
                        className="px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        Add Candidate
                    </button>
                    <button
                        onClick={() => setShowJobModal(true)}
                        className="px-6 py-3 rounded-full bg-[#3b82f6] text-white font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:bg-[#2563eb] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Post New Job
                    </button>
                </div>
            </div>

            {/* Candidate Modal */}
            {showCandidateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCandidateModal(false)}>
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Add New Candidate</h2>
                            <button onClick={() => setShowCandidateModal(false)} className="size-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-500">close</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                                    <input
                                        type="text"
                                        value={candidateData.firstName}
                                        onChange={(e) => setCandidateData({ ...candidateData, firstName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name *</label>
                                    <input
                                        type="text"
                                        value={candidateData.lastName}
                                        onChange={(e) => setCandidateData({ ...candidateData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={candidateData.email}
                                    onChange={(e) => setCandidateData({ ...candidateData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={candidateData.phone}
                                    onChange={(e) => setCandidateData({ ...candidateData, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Apply for Job *</label>
                                <select
                                    value={candidateData.jobId}
                                    onChange={(e) => setCandidateData({ ...candidateData, jobId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                >
                                    <option value="">Select Job...</option>
                                    {jobs.map(job => (
                                        <option key={job._id} value={job._id}>{job.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowCandidateModal(false)} className="flex-1 px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleAddCandidate} className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30">Add Candidate</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Job Posting Modal */}
            {showJobModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowJobModal(false)}>
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Post New Job</h2>
                            <button onClick={() => setShowJobModal(false)} className="size-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-500">close</span>
                            </button>
                        </div>
                        {/* Job Form same as before */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Job Title *</label>
                                <input
                                    type="text"
                                    value={jobData.title}
                                    onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                    placeholder="e.g. Senior Frontend Engineer"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Department *</label>
                                    <select
                                        value={jobData.department}
                                        onChange={(e) => setJobData({ ...jobData, department: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                    >
                                        <option value="">Select...</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="HR">HR</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Finance">Finance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                                    <select
                                        value={jobData.type}
                                        onChange={(e) => setJobData({ ...jobData, type: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    value={jobData.location}
                                    onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                    placeholder="e.g. Remote, New York, Hybrid"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={jobData.description}
                                    onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                                    placeholder="Job description, requirements, responsibilities..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowJobModal(false)}
                                className="flex-1 px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePostJob}
                                className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                            >
                                Post Job
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interview Scheduler Modal */}
            {showInterviewModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInterviewModal(false)}>
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Schedule Interview</h2>
                            <button onClick={() => setShowInterviewModal(false)} className="size-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-500">close</span>
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Scheduling for <strong>{selectedCandidate?.firstName} {selectedCandidate?.lastName}</strong></p>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                                    <input type="date" value={interviewData.date} onChange={e => setInterviewData({ ...interviewData, date: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                                    <input type="time" value={interviewData.time} onChange={e => setInterviewData({ ...interviewData, time: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Interviewer</label>
                                <input placeholder="e.g. John Doe" value={interviewData.interviewer} onChange={e => setInterviewData({ ...interviewData, interviewer: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Meeting Link</label>
                                <input placeholder="e.g. zoom.us/j/123..." value={interviewData.link} onChange={e => setInterviewData({ ...interviewData, link: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none" />
                            </div>

                            <button onClick={handleScheduleInterview} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 mt-4">
                                Send Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Kanban columns */}
            <div className="flex gap-6 overflow-x-auto pb-4">
                {stages.map((stage, i) => {
                    const stageCandidates = candidates.filter(c => c.stage === stage);
                    return (
                        <div key={i} className="min-w-[320px] bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-200px)]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-[#111827]">{stage}</h3>
                                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-xs font-bold">{stageCandidates.length}</span>
                            </div>

                            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                                {stageCandidates.map(candidate => (
                                    <div key={candidate._id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-[#111827]">{candidate.firstName} {candidate.lastName}</h4>
                                            <span className={`size-2 rounded-full ${['bg-yellow-400', 'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-green-600', 'bg-red-400'][i] || 'bg-gray-400'}`}></span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium mb-3">{candidate.jobId?.title || 'Unknown Role'}</p>

                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                                {candidate.firstName[0]}{candidate.lastName[0]}
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-bold ml-auto">
                                                {new Date(candidate.appliedAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Actions for Screening/Interviewing */}
                                        {(stage === 'Sourced' || stage === 'Screening' || stage === 'Interviewing') && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 hidden group-hover:flex justify-between">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openInterview(candidate); }}
                                                    className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                                                >
                                                    Schedule Interview
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {stageCandidates.length === 0 && (
                                    <div className="text-center text-gray-400 text-sm mt-10">
                                        No candidates
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
