'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface UserProfile {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    department: string;
    role: string;
    position: string;
    employeeId: string;
    address?: {
        street?: string;
        city?: string;
        country?: string;
    };
}

export default function EmployeeProfilePage() {
    const router = useRouter();
    const params = useParams(); // { id: '...' }
    const id = params?.id as string;

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form State (could simplify by using user object directly but separate state is safer for cancel)
    const [formData, setFormData] = useState<Partial<UserProfile>>({});

    useEffect(() => {
        if (!id) return;
        fetch(`/api/users/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                setUser(data);
                setFormData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const updated = await res.json();
                setUser(updated);
                setIsEditing(false);
                alert('Profile updated successfully');
            } else {
                alert('Failed to update');
            }
        } catch (e) {
            alert('Error updating profile');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!user) return <div className="p-8 text-center">User not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Employee Profile</h1>
                <div className="ml-auto">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button onClick={() => { setIsEditing(false); setFormData(user); }} className="px-3 py-1 text-sm font-bold text-slate-600 bg-slate-200 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-3 py-1 text-sm font-bold text-white bg-[#135bec] rounded-lg">Save</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-3 py-1 text-sm font-bold text-[#135bec] border border-[#135bec] rounded-lg bg-blue-50 dark:bg-blue-900/20">Edit</button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                {/* Header Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                    <div className="size-24 rounded-full bg-slate-200 flex items-center justify-center text-4xl font-bold text-slate-500 mb-4">
                        {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {isEditing ? (
                            <div className="flex gap-2 justify-center">
                                <input className="border rounded p-1 text-center w-32" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                                <input className="border rounded p-1 text-center w-32" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                            </div>
                        ) : (
                            `${user.firstName} ${user.lastName}`
                        )}
                    </h2>
                    <p className="text-slate-500">{user.position || user.role}</p>
                    <div className="mt-2 text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500">ID: {user.employeeId}</div>
                </div>

                {/* Details Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Contact & Work Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Email</label>
                            {isEditing ? (
                                <input className="w-full border rounded p-2 text-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            ) : (
                                <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Phone</label>
                            {isEditing ? (
                                <input className="w-full border rounded p-2 text-sm" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                            ) : (
                                <p className="font-medium text-slate-900 dark:text-white">{user.phoneNumber || 'N/A'}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Department</label>
                            {isEditing ? (
                                <select className="w-full border rounded p-2 text-sm" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                    <option>Engineering</option>
                                    <option>HR</option>
                                    <option>Sales</option>
                                    <option>Marketing</option>
                                </select>
                            ) : (
                                <p className="font-medium text-slate-900 dark:text-white">{user.department}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Role</label>
                            {isEditing ? (
                                <select className="w-full border rounded p-2 text-sm" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="employee">Employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="hr">HR</option>
                                </select>
                            ) : (
                                <p className="font-medium text-slate-900 dark:text-white capitalize">{user.role}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
