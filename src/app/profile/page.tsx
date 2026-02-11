'use client';

import { useSession } from 'next-auth/react';

export default function ProfilePage() {
    const { data: session } = useSession();

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">My Profile</h1>
                    <p className="text-[#6b7280] font-medium">Manage your account and personal details.</p>
                </div>
                <button
                    onClick={() => alert('Profile editing is currently disabled by administrator.')}
                    className="px-6 py-3 rounded-full bg-[#3b82f6] text-white font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:bg-[#2563eb] transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                    Edit Profile
                </button>
            </div>

            {/* Profile Card */}
            <div className="soft-card p-8 flex flex-col items-center text-center relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
                <div className="size-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center text-white text-5xl font-bold mb-6 relative z-10">
                    {session?.user?.name?.[0] || 'U'}
                    <div className="absolute bottom-1 right-1 size-6 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                <h2 className="text-3xl font-extrabold text-[#111827] mb-2">{session?.user?.name || 'User Name'}</h2>
                <p className="text-[#6b7280] font-medium text-lg mb-6">Software Engineer • Engineering</p>

                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-bold text-gray-700">
                        <span className="material-symbols-outlined text-gray-400">mail</span>
                        {session?.user?.email || 'user@company.com'}
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-bold text-gray-700">
                        <span className="material-symbols-outlined text-gray-400">call</span>
                        +1 (555) 123-4567
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-bold text-gray-700">
                        <span className="material-symbols-outlined text-gray-400">location_on</span>
                        New York, USA
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Personal Info */}
                <div className="soft-card p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-[#111827] text-lg">Personal Information</h3>
                        <button className="text-[#3b82f6] text-sm font-bold">Update</button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500 text-sm font-medium">Date of Birth</span>
                            <span className="text-[#111827] font-bold text-sm">Oct 24, 1995</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500 text-sm font-medium">Gender</span>
                            <span className="text-[#111827] font-bold text-sm">Male</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500 text-sm font-medium">Nationality</span>
                            <span className="text-[#111827] font-bold text-sm">American</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500 text-sm font-medium">Marital Status</span>
                            <span className="text-[#111827] font-bold text-sm">Single</span>
                        </div>
                    </div>
                </div>

                {/* Employment Info */}
                <div className="soft-card p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-[#111827] text-lg">Employment Details</h3>
                        <button className="text-[#3b82f6] text-sm font-bold">View Contract</button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500 text-sm font-medium">Joined Date</span>
                            <span className="text-[#111827] font-bold text-sm">Jan 15, 2023</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500 text-sm font-medium">Department</span>
                            <span className="text-[#111827] font-bold text-sm">Engineering</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500 text-sm font-medium">Manager</span>
                            <span className="text-[#111827] font-bold text-sm">James Wilson</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500 text-sm font-medium">Work Location</span>
                            <span className="text-[#111827] font-bold text-sm">HQ - Floor 4</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
