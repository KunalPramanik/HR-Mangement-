'use client';

export default function RecruitmentPage() {
    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] mb-2">Recruitment Pipeline</h1>
                    <p className="text-[#6b7280] font-medium">Manage job postings and candidate applications.</p>
                </div>
                <button className="px-6 py-3 rounded-full bg-[#3b82f6] text-white font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:bg-[#2563eb] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Post New Job
                </button>
            </div>

            {/* Kanban columns */}
            <div className="flex gap-6 overflow-x-auto pb-4">
                {['Sourced', 'Interviewing', 'Offer', 'Hired'].map((stage, i) => (
                    <div key={i} className="min-w-[320px] bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-200px)]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-[#111827]">{stage}</h3>
                            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-xs font-bold">4</span>
                        </div>

                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                            {[1, 2, 3, 4].map(j => (
                                <div key={j} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-[#111827]">Candidate Name</h4>
                                        <span className={`size-2 rounded-full ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-blue-400' : i === 2 ? 'bg-purple-400' : 'bg-green-400'}`}></span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium mb-3">Senior Frontend Engineer</p>

                                    <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">JD</div>
                                        <span className="text-[10px] text-gray-400 font-bold ml-auto">2d ago</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
