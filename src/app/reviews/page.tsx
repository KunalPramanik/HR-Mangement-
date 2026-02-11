'use client';

export default function PerformanceReviewsPage() {
    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] mb-2">My Reviews</h1>
                    <p className="text-[#6b7280] font-medium">Track your performance and development goals.</p>
                </div>
                <button className="px-6 py-3 rounded-full bg-[#3b82f6] text-white font-bold shadow-lg hover:shadow-xl transition-all">New Review Cycle</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card */}
                <div className="soft-card p-6 border-t-4 border-green-500 relative group">
                    <div className="absolute top-4 right-4 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Completed</div>
                    <h2 className="text-xl font-bold text-[#111827] mb-1">Q4 Performance Review</h2>
                    <p className="text-sm text-gray-500 mb-6">Jan 15, 2025</p>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 text-center border-r border-gray-100 last:border-0">
                            <h4 className="text-2xl font-extrabold text-[#111827]">4.8</h4>
                            <p className="text-xs text-gray-400 font-bold uppercase">Overall</p>
                        </div>
                        <div className="flex-1 text-center border-r border-gray-100 last:border-0">
                            <h4 className="text-2xl font-extrabold text-[#111827]">5.0</h4>
                            <p className="text-xs text-gray-400 font-bold uppercase">Goals</p>
                        </div>
                        <div className="flex-1 text-center border-r border-gray-100 last:border-0">
                            <h4 className="text-2xl font-extrabold text-[#111827]">4.6</h4>
                            <p className="text-xs text-gray-400 font-bold uppercase">Skills</p>
                        </div>
                    </div>

                    <button className="w-full py-3 rounded-lg bg-gray-50 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-colors">View Feedback</button>
                </div>

                {/* Active Card */}
                <div className="soft-card p-6 border-t-4 border-blue-500 relative group">
                    <div className="absolute top-4 right-4 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">In Progress</div>
                    <h2 className="text-xl font-bold text-[#111827] mb-1">2026 Goals Setting</h2>
                    <p className="text-sm text-gray-500 mb-6">Due Feb 28, 2025</p>

                    <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                        <div className="bg-blue-500 h-2 rounded-full w-[35%] transition-all"></div>
                    </div>

                    <button className="w-full py-3 rounded-lg bg-[#3b82f6] text-white font-bold text-sm shadow-md hover:bg-blue-600 transition-colors">Continue Self-Assessment</button>
                </div>
            </div>
        </div>
    );
}
