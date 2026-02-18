'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function ProfilePage() {
    const { data: session } = useSession();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        phoneNumber: '',
        currentAddress: '',
        personalEmail: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
    });

    useEffect(() => {
        if (session?.user?.id) fetchProfile();
    }, [session]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/users?id=${session?.user?.id}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setFormData({
                    phoneNumber: data.phoneNumber || '',
                    currentAddress: data.currentAddress || '',
                    personalEmail: data.personalEmail || '',
                    emergencyContactName: data.emergencyContact?.name || '',
                    emergencyContactPhone: data.emergencyContact?.phoneNumber || ''
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users', {
                method: 'PUT', // Assuming PUT /api/users handles update by ID
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: session?.user?.id,
                    phoneNumber: formData.phoneNumber,
                    currentAddress: formData.currentAddress,
                    personalEmail: formData.personalEmail,
                    emergencyContact: {
                        name: formData.emergencyContactName,
                        phoneNumber: formData.emergencyContactPhone
                    }
                })
            });

            if (res.ok) {
                toast.success('Profile updated successfully');
                fetchProfile();
            } else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            toast.error('Error updating profile');
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading profile...</div>;

    return (
        <div className="p-8 max-w-[1200px] mx-auto pb-20">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Profile</h1>
            <p className="text-slate-500 mb-8">Manage your personal information.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
                    <div className="flex flex-col items-center mb-6">
                        <div className="size-24 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-3xl font-bold mb-4">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</h2>
                        <p className="text-slate-500 dark:text-slate-400">{user.position} • {user.department}</p>
                    </div>
                    <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-700">
                            <span className="text-slate-400">Employee ID</span>
                            <span className="font-medium">{user.employeeId}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-700">
                            <span className="text-slate-400">Email</span>
                            <span className="font-medium">{user.email}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-700">
                            <span className="text-slate-400">Joined</span>
                            <span className="font-medium">{new Date(user.dateOfJoining).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Status</span>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">{user.employmentStatus}</span>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Edit Details</h3>
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                                <input value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Personal Email</label>
                                <input value={formData.personalEmail} onChange={e => setFormData({ ...formData, personalEmail: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Current Address</label>
                            <textarea rows={3} value={formData.currentAddress} onChange={e => setFormData({ ...formData, currentAddress: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none resize-none" />
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Emergency Contact</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Name</label>
                                    <input value={formData.emergencyContactName} onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                                    <input value={formData.emergencyContactPhone} onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
