'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [id, setId] = useState<string>('');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
                    alert('User not found');
                    router.push('/hr/employees');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Filter out read-only fields or handle in API
            // Simple updated payload
            const payload = {
                firstName: user.firstName,
                lastName: user.lastName,
                position: user.position,
                department: user.department,
                phoneNumber: user.phoneNumber,
                personalEmail: user.personalEmail
            };

            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Employee updated successfully');
                router.push(`/hr/employees/${id}`);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to update');
            }
        } catch (error) {
            alert('Error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-gray-400">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-extrabold text-[#111827] mb-8">Edit Employee</h1>

            <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                        <input
                            type="text"
                            required
                            value={user.firstName}
                            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                        <input
                            type="text"
                            required
                            value={user.lastName}
                            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Position</label>
                        <input
                            type="text"
                            required
                            value={user.position}
                            onChange={(e) => setUser({ ...user, position: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
                        <input
                            type="text"
                            required
                            value={user.department}
                            onChange={(e) => setUser({ ...user, department: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                        <input
                            type="tel"
                            value={user.phoneNumber || ''}
                            onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Personal Email</label>
                        <input
                            type="email"
                            value={user.personalEmail || ''}
                            onChange={(e) => setUser({ ...user, personalEmail: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="pt-6 flex gap-4 border-t border-gray-100 mt-6">
                    <button type="button" onClick={() => router.back()} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-[#3b82f6] text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 disabled:opacity-70">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
