'use client';

import { use, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap the params Promise
    const { id } = use(params);

    const { data: session } = useSession();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Check permissions
    const isSelf = session?.user?.id === id;
    const isAdmin = ['admin', 'hr', 'director'].includes(session?.user?.role || '');
    const canEdit = isSelf || isAdmin;

    const [formData, setFormData] = useState({
        phoneNumber: '',
        currentAddress: '',
        personalEmail: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
    });

    useEffect(() => {
        if (id) fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/users?id=${id}`);
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
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id,
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
                setIsEditing(false);
            } else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            toast.error('Error updating profile');
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading profile...</div>;
    if (!user) return <div className="p-12 text-center text-red-500">User not found</div>;

    return (
        <div className="p-8 max-w-[1200px] mx-auto pb-20">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{user.firstName}'s Profile</h1>
            <p className="text-slate-500 mb-8">View and manage employee information.</p>

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
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {user.isActive ? 'Active' : 'Suspended'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personal Details</h3>
                        {canEdit && !isEditing && (
                            <button onClick={() => setIsEditing(true)} className="text-blue-600 font-bold text-sm hover:underline">Edit Details</button>
                        )}
                        {canEdit && isEditing && (
                            <button onClick={() => setIsEditing(false)} className="text-red-500 font-bold text-sm hover:underline">Cancel Edit</button>
                        )}
                    </div>

                    {isEditing ? (
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
                    ) : (
                        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
                            <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                                <div>
                                    <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{user.phoneNumber || 'Not set'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Personal Email</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{user.personalEmail || 'Not set'}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Address</span>
                                <p className="font-medium text-slate-900 dark:text-white">{user.currentAddress || 'Not set'}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Emergency Contact</h4>
                                <p className="font-medium">{user.emergencyContact?.name || 'Not set'} - {user.emergencyContact?.phoneNumber}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
