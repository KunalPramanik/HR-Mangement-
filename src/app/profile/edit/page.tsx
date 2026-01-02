'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function EditProfilePage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form inputs
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        profilePicture: '',
        coverPhoto: '',
        skills: [] as string[],
        certifications: [] as any[],
        emergencyContact: { name: '', relationship: '', phoneNumber: '' }
    });

    // Helper states for adding list items
    const [newSkill, setNewSkill] = useState('');
    const [newCert, setNewCert] = useState({ name: '', issuer: '', date: '' });

    useEffect(() => {
        if (session?.user?.email) {
            const params = new URLSearchParams(window.location.search);
            const targetEmail = params.get('email') || session.user.email;

            fetch(`/api/users?email=${targetEmail}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        setUser(data);
                        setFormData({
                            firstName: data.firstName || '',
                            lastName: data.lastName || '',
                            phoneNumber: data.phoneNumber || '',
                            address: data.address || '',
                            profilePicture: data.profilePicture || '',
                            coverPhoto: data.coverPhoto || '',
                            skills: data.skills || [],
                            certifications: data.certifications?.map((c: any) => ({ ...c, date: c.date ? c.date.split('T')[0] : '' })) || [],
                            emergencyContact: data.emergencyContact || { name: '', relationship: '', phoneNumber: '' }
                        });
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        if (!user?._id) return;

        try {
            const res = await fetch(`/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Profile updated successfully!');
                router.back();
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile: {formData.firstName}</h1>
            </div>

            <form className="flex flex-col gap-4 max-w-4xl mx-auto" onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="size-24 rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-500 overflow-hidden ring-4 ring-white dark:ring-slate-700">
                            {formData.profilePicture ? (
                                <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-4xl">person</span>
                            )}
                        </div>
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Profile Picture URL</label>
                        <input
                            type="text"
                            placeholder="https://example.com/photo.jpg"
                            value={formData.profilePicture}
                            onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                            className="block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm"
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Photo URL</label>
                        <input
                            type="text"
                            placeholder="https://example.com/cover.jpg"
                            value={formData.coverPhoto}
                            onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
                            className="block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 text-sm"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Personal Details</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</span>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</span>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                                />
                            </label>
                        </div>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</span>
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</span>
                            <div className="flex flex-col gap-2">
                                <textarea
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                                    placeholder="e.g. 123 Main St, New York, NY"
                                ></textarea>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (navigator.geolocation) {
                                            navigator.geolocation.getCurrentPosition(
                                                (pos) => {
                                                    const { latitude, longitude } = pos.coords;
                                                    setFormData({ ...formData, address: `${latitude}, ${longitude}` });
                                                    alert('Location Fetched!');
                                                },
                                                (err) => alert('Error fetching location: ' + err.message)
                                            );
                                        } else {
                                            alert('Geolocation is not supported by this browser.');
                                        }
                                    }}
                                    className="self-start bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold px-3 py-1 rounded-lg flex items-center gap-1 text-sm"
                                >
                                    <span className="material-symbols-outlined text-[16px]">my_location</span>
                                    Get Location
                                </button>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-red-500">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Emergency Contact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
                            <input
                                type="text"
                                value={formData.emergencyContact?.name || ''}
                                onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, name: e.target.value } })}
                                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Relationship</span>
                            <input
                                type="text"
                                value={formData.emergencyContact?.relationship || ''}
                                onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, relationship: e.target.value } })}
                                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</span>
                            <input
                                type="text"
                                value={formData.emergencyContact?.phoneNumber || ''}
                                onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, phoneNumber: e.target.value } })}
                                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                            />
                        </label>
                    </div>
                </div>

                {/* Skills */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-green-500">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Skills</h2>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newSkill.trim()) {
                                        setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
                                        setNewSkill('');
                                    }
                                }
                            }}
                            className="flex-1 rounded-lg border-slate-300 bg-slate-50 p-2.5"
                            placeholder="Add a skill..."
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (newSkill.trim()) {
                                    setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
                                    setNewSkill('');
                                }
                            }}
                            className="bg-green-600 text-white px-4 rounded-lg font-bold"
                        >Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))}
                                    className="hover:text-red-600 font-bold"
                                >×</button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Certifications */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-purple-500">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Certifications</h2>
                    <div className="space-y-3 mb-4">
                        {formData.certifications.map((cert, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div>
                                    <p className="font-bold">{cert.name}</p>
                                    <p className="text-xs text-slate-500">Issued by {cert.issuer} on {cert.date}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== idx) }))}
                                    className="text-red-500 p-1 hover:bg-red-50 rounded"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-300">
                        <input type="text" placeholder="Certificate Name" value={newCert.name} onChange={e => setNewCert({ ...newCert, name: e.target.value })} className="md:col-span-1 p-2 border rounded" />
                        <input type="text" placeholder="Issuer" value={newCert.issuer} onChange={e => setNewCert({ ...newCert, issuer: e.target.value })} className="md:col-span-1 p-2 border rounded" />
                        <input type="date" value={newCert.date} onChange={e => setNewCert({ ...newCert, date: e.target.value })} className="md:col-span-1 p-2 border rounded" />
                        <button
                            type="button"
                            onClick={() => {
                                if (newCert.name && newCert.issuer) {
                                    setFormData(prev => ({ ...prev, certifications: [...prev.certifications, newCert] }));
                                    setNewCert({ name: '', issuer: '', date: '' });
                                }
                            }}
                            className="bg-purple-600 text-white p-2 rounded font-bold"
                        >
                            Add
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#135bec] text-white font-bold p-4 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}

