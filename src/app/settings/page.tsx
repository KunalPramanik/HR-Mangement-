'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';



export default function SettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile'); // Default to Profile for everyone
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // User Profile State
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        avatar: '',
        role: '',
        skills: [] as string[],
        certifications: [] as any[],
        emergencyContact: { name: '', relationship: '', phoneNumber: '' }
    });

    const [newSkill, setNewSkill] = useState('');
    const [newCert, setNewCert] = useState({ name: '', issuer: '', date: '' });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });



    // Passkey State
    const [passkeys, setPasskeys] = useState<any[]>([]);
    const [registeringPasskey, setRegisteringPasskey] = useState(false);

    // Admin Config State
    const [settings, setSettings] = useState<any>({
        security: { passwordPolicy: {}, twoFactorAuth: {} },
        organization: { departments: [] },
        holidays: [],
        modules: { payroll: {}, performance: {}, recruitment: {} },
        notifications: {}
    });

    // ... (Password State)

    // ... (Admin Config State)

    // Check if user has admin/hr privileges to see extra tabs
    const allowedAdminRoles = ['admin', 'director', 'cxo', 'vp', 'hr'];
    const isAdmin = session?.user?.role ? allowedAdminRoles.includes(session.user.role) : false;

    useEffect(() => {
        if (!session) return;

        // Fetch User Profile
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setProfile({
                        firstName: data.firstName || session.user.name?.split(' ')[0] || '',
                        lastName: data.lastName || session.user.name?.split(' ')[1] || '',
                        phoneNumber: data.phoneNumber || '',
                        address: data.address || '',
                        avatar: data.profilePicture || '', // Changed to profilePicture to match model
                        role: data.role || session.user.role,
                        skills: data.skills || [],
                        certifications: data.certifications ? data.certifications.map((c: any) => ({ ...c, date: c.date ? c.date.split('T')[0] : '' })) : [],
                        emergencyContact: data.emergencyContact || { name: '', relationship: '', phoneNumber: '' }
                    });
                }
            } catch (e) { console.error(e); }
        };

        fetchProfile();

        // Fetch Passkeys
        const fetchPasskeys = async () => {
            try {
                const res = await fetch('/api/user/passkeys');
                if (res.ok) {
                    const data = await res.json();
                    setPasskeys(data.passkeys || []);
                }
            } catch (e) { console.error('Failed to fetch passkeys', e); }
        };
        fetchPasskeys();

        // Fetch System Settings (Only if Admin)
        if (isAdmin) {
            fetch('/api/settings')
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) setSettings(data);
                })
                .catch(err => console.error(err));
        }
        setLoading(false);
    }, [session, isAdmin]);

    const handleSystemSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                alert('System settings captured successfully!');
            } else {
                const data = await res.json();
                alert('Failed to save settings: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            console.error(e);
            alert('Network error while saving settings');
        }
        setSaving(false);
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: profile.phoneNumber,
                    address: profile.address,
                    avatar: profile.avatar,
                    skills: profile.skills,
                    certifications: profile.certifications,
                    emergencyContact: profile.emergencyContact
                })
            });

            if (res.ok) {
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile');
            }
        } catch (e) {
            alert('Network error');
        }
        setSaving(false);
    };

    const handleAvatarChange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Upload to server
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                // Set the URL returned from server
                setProfile(prev => ({ ...prev, avatar: data.url }));
            } else {
                alert('Failed to upload image');
            }
        } catch (err) {
            console.error(err);
            alert('Error uploading image');
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords don't match");
            setSaving(false);
            return;
        }

        try {
            const res = await fetch('/api/user/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (res.ok) {
                alert('Password changed successfully!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update password');
            }
        } catch (e) {
            alert('Network error');
        }
        setSaving(false);
    };

    const handleRegisterPasskey = async () => {
        setRegisteringPasskey(true);
        try {
            // Import dynamically to avoid SSR issues if package is missing
            const { startRegistration } = await import('@simplewebauthn/browser');

            // 1. Get options from server
            const resp = await fetch('/api/auth/webauthn/register/start');
            const optionsJSON = await resp.json();

            if (optionsJSON.error) throw new Error(optionsJSON.error);

            // 2. Pass options to browser authenticator
            const attResp = await startRegistration(optionsJSON);

            // 3. Send response to server
            const verificationResp = await fetch('/api/auth/webauthn/register/finish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attResp),
            });

            const verificationJSON = await verificationResp.json();

            if (verificationJSON.verified) {
                alert('Device registered successfully!');
                // Refresh list
                const res = await fetch('/api/user/passkeys');
                const data = await res.json();
                setPasskeys(data.passkeys || []);
            } else {
                alert(`Registration failed: ${verificationJSON.error}`);
            }
        } catch (error: any) {
            console.error(error);
            if (error.name === 'InvalidStateError') {
                alert('This device is already registered.');
            } else {
                alert('Failed to register device. ' + error.message);
            }
        }
        setRegisteringPasskey(false);
    };

    const handleDeletePasskey = async (id: string) => {
        if (!confirm('Are you sure you want to remove this device?')) return;
        try {
            await fetch(`/api/user/passkeys?id=${id}`, { method: 'DELETE' });
            setPasskeys(prev => prev.filter(p => p._id !== id));
        } catch (e) { console.error(e); }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in relative z-0">
            <h1 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined">settings</span> Settings
            </h1>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 mb-6 pb-2 overflow-x-auto">
                {['profile', 'account'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab
                            ? 'bg-[#135bec] text-white shadow-md transform scale-105'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        {tab === 'profile' ? 'My Profile' : 'Security'}
                    </button>
                ))}

                {isAdmin && (
                    <>
                        <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 mx-2 self-center"></div>
                        {[
                            { id: 'general', label: 'Organization' },
                            { id: 'admin_security', label: 'Policies' },
                            { id: 'modules', label: 'Modules' },
                            { id: 'holidays', label: 'Holidays' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-[#135bec] text-white shadow-md transform scale-105'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px]">

                {/* 1. MY PROFILE */}
                {
                    activeTab === 'profile' && (
                        <form onSubmit={handleProfileSave} className="max-w-3xl space-y-8 animate-fade-in">
                            <div className="flex items-center gap-6 mb-8 border-b pb-6 border-slate-200 dark:border-slate-700">
                                <div className="relative group">
                                    <div className="size-24 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-4 border-white dark:border-slate-800 shadow-md">
                                        {profile.avatar ? (
                                            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl font-bold">
                                                {profile.firstName[0]}{profile.lastName[0]}
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-2 bg-[#135bec] text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-600 transition-colors">
                                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold dark:text-white">{profile.firstName} {profile.lastName}</h2>
                                    <p className="text-slate-500 uppercase text-xs font-bold tracking-wider">{profile.role}</p>
                                </div>
                            </div>

                            {/* Section: Personal Information */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 dark:text-white border-l-4 border-[#135bec] pl-3">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="block">
                                        <span className="text-sm font-medium">First Name</span>
                                        <input type="text" value={profile.firstName} disabled className="mt-1 w-full bg-slate-100 text-slate-600 p-2 border rounded-lg cursor-not-allowed" />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium">Last Name</span>
                                        <input type="text" value={profile.lastName} disabled className="mt-1 w-full bg-slate-100 text-slate-600 p-2 border rounded-lg cursor-not-allowed" />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium">Phone Number</span>
                                        <input type="tel" value={profile.phoneNumber} onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })} className="mt-1 w-full bg-slate-50 p-2 border rounded-lg" placeholder="+1 234 567 8900" />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium">Role</span>
                                        <input type="text" value={profile.role} disabled className="mt-1 w-full bg-slate-100 text-slate-500 p-2 border rounded-lg cursor-not-allowed uppercase" />
                                    </label>
                                    <label className="block md:col-span-2">
                                        <span className="text-sm font-medium">Address</span>
                                        <textarea value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} className="mt-1 w-full bg-slate-50 p-2 border rounded-lg" rows={2} placeholder="Enter your residential address..." />
                                    </label>
                                </div>
                            </div>

                            {/* Section: Emergency Contact */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 dark:text-white border-l-4 border-red-500 pl-3">Emergency Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <label className="block">
                                        <span className="text-sm font-medium">Contact Name</span>
                                        <input type="text" value={profile.emergencyContact?.name || ''} onChange={e => setProfile({ ...profile, emergencyContact: { ...profile.emergencyContact, name: e.target.value } })} className="mt-1 w-full bg-slate-50 p-2 border rounded-lg" placeholder="e.g. Spouse/Parent" />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium">Relationship</span>
                                        <input type="text" value={profile.emergencyContact?.relationship || ''} onChange={e => setProfile({ ...profile, emergencyContact: { ...profile.emergencyContact, relationship: e.target.value } })} className="mt-1 w-full bg-slate-50 p-2 border rounded-lg" placeholder="e.g. Father" />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium">Phone</span>
                                        <input type="tel" value={profile.emergencyContact?.phoneNumber || ''} onChange={e => setProfile({ ...profile, emergencyContact: { ...profile.emergencyContact, phoneNumber: e.target.value } })} className="mt-1 w-full bg-slate-50 p-2 border rounded-lg" placeholder="Emergency Phone" />
                                    </label>
                                </div>
                            </div>

                            {/* Section: Skills */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 dark:text-white border-l-4 border-green-500 pl-3">Professional Skills</h3>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (newSkill.trim()) {
                                                    setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
                                                    setNewSkill('');
                                                }
                                            }
                                        }}
                                        className="flex-1 bg-slate-50 p-2 border rounded-lg"
                                        placeholder="Add a skill (e.g. React, Project Management)... Press Enter"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (newSkill.trim()) {
                                                setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
                                                setNewSkill('');
                                            }
                                        }}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills?.length > 0 ? (
                                        profile.skills.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => setProfile(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))}
                                                    className="hover:text-red-600 font-bold"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 text-sm italic">No skills added yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Section: Certifications */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 dark:text-white border-l-4 border-purple-500 pl-3">Certifications</h3>
                                <div className="space-y-3 mb-4">
                                    {profile.certifications?.map((cert, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                                            <div>
                                                <p className="font-bold">{cert.name}</p>
                                                <p className="text-xs text-slate-500">Issued by {cert.issuer} on {cert.date}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setProfile(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== idx) }))}
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
                                                setProfile(prev => ({ ...prev, certifications: [...prev.certifications, newCert] }));
                                                setNewCert({ name: '', issuer: '', date: '' });
                                            }
                                        }}
                                        className="bg-purple-600 text-white p-2 rounded font-bold"
                                    >
                                        Add Cert
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={saving} className="w-full bg-[#135bec] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                                {saving ? <span className="animate-spin rounded-full size-5 border-2 border-white border-t-transparent"></span> : null}
                                {saving ? 'Saving Profile...' : 'Save All Changes'}
                            </button>
                        </form>
                    )
                }



                {/* 2. ACCOUNT SECURITY (USER) */}
                {
                    activeTab === 'account' && (
                        <div className="max-w-xl space-y-8 animate-fade-in">
                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <h2 className="text-xl font-bold mb-4 dark:text-white">Change Password</h2>
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-sm font-medium">Current Password</span>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.currentPassword}
                                            onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="mt-1 w-full bg-slate-50 p-2 border rounded-lg"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium">New Password</span>
                                        <input
                                            type="password"
                                            required
                                            minLength={8}
                                            value={passwordData.newPassword}
                                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="mt-1 w-full bg-slate-50 p-2 border rounded-lg"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium">Confirm New Password</span>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.confirmPassword}
                                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="mt-1 w-full bg-slate-50 p-2 border rounded-lg"
                                        />
                                    </label>
                                </div>
                                <div className="pt-4">
                                    <button type="submit" disabled={saving} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800">
                                        {saving ? 'Updating...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>

                            {/* Biometric / Passkeys Section */}
                            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-blue-600">fingerprint</span>
                                            Biometric Login
                                        </h2>
                                        <p className="text-sm text-slate-500">Manage FaceID, TouchID, or Security Keys.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRegisterPasskey}
                                        disabled={registeringPasskey}
                                        className="bg-[#135bec] text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        {registeringPasskey ? (
                                            <span className="animate-spin rounded-full size-4 border-2 border-white border-t-transparent"></span>
                                        ) : (
                                            <span className="material-symbols-outlined text-lg">add_circle</span>
                                        )}
                                        Add Device
                                    </button>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    {passkeys.length > 0 ? (
                                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {passkeys.map((pk) => (
                                                <div key={pk._id} className="p-4 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                            <span className="material-symbols-outlined">
                                                                {pk.transports?.includes('internal') ? 'smartphone' : 'usb'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white">{pk.deviceName || 'Unknown Device'}</p>
                                                            <p className="text-xs text-slate-500">Added on {new Date(pk.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeletePasskey(pk._id)}
                                                        className="size-8 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                                                        title="Remove Device"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">no_accounts</span>
                                            <p>No biometric devices registered yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* --- ADMIN ONLY TABS --- */}

                {/* 3. GENERAL & ORG */}
                {
                    isAdmin && activeTab === 'general' && (
                        <div className="space-y-6 max-w-2xl animate-fade-in">
                            <h2 className="text-xl font-bold mb-4 dark:text-white">Organization Details</h2>
                            <div className="grid gap-4">
                                <label className="block">
                                    <span className="text-sm font-medium">Company Name</span>
                                    <input
                                        type="text"
                                        value={settings.organization?.companyName || ''}
                                        onChange={(e) => setSettings({ ...settings, organization: { ...settings.organization, companyName: e.target.value } })}
                                        className="mt-1 w-full bg-slate-50 p-2 border rounded-lg"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium">Departments (Comma separated)</span>
                                    <input
                                        type="text"
                                        value={settings.organization?.departments?.join(', ') || ''}
                                        onChange={(e) => setSettings({ ...settings, organization: { ...settings.organization, departments: e.target.value.split(',').map((s: string) => s.trim()) } })}
                                        className="mt-1 w-full bg-slate-50 p-2 border rounded-lg"
                                        placeholder="Engineering, HR, Sales"
                                    />
                                </label>
                            </div>

                            <h2 className="text-xl font-bold mb-4 pt-4 border-t dark:text-white">Notifications</h2>
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications?.systemAlerts ?? true}
                                        onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, systemAlerts: e.target.checked } })}
                                        className="w-5 h-5 text-blue-600 rounded"
                                    />
                                    <div>
                                        <span className="font-medium">System Alerts (Blinking Indicator)</span>
                                        <p className="text-xs text-slate-500">Show a blinking light on notifications when unread items exist.</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications?.emailEnabled ?? true}
                                        onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, emailEnabled: e.target.checked } })}
                                        className="w-5 h-5 text-blue-600 rounded"
                                    />
                                    <div>
                                        <span className="font-medium">Email Notifications</span>
                                        <p className="text-xs text-slate-500">Send email digests for important updates.</p>
                                    </div>
                                </label>
                            </div>
                            <div className="pt-4 border-t mt-4 flex justify-end">
                                <button
                                    onClick={handleSystemSave}
                                    disabled={saving}
                                    className="bg-[#135bec] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
                                >
                                    {saving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* 4. ADMIN SECURITY & POLICIES */}
                {
                    isAdmin && activeTab === 'admin_security' && (
                        <div className="space-y-6 max-w-2xl animate-fade-in">
                            <h2 className="text-xl font-bold mb-4 dark:text-white">Global Access Policies</h2>

                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2">
                                        <span className="material-symbols-outlined">verified_user</span> 2FA Enforcement
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.security?.twoFactorAuth?.enabled ?? false}
                                            onChange={(e) => setSettings({ ...settings, security: { ...settings.security, twoFactorAuth: { ...settings.security.twoFactorAuth, enabled: e.target.checked } } })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div className="mt-3 ml-1">
                                    <label className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            checked={settings.security?.twoFactorAuth?.enforceForAdmins ?? true}
                                            onChange={(e) => setSettings({ ...settings, security: { ...settings.security, twoFactorAuth: { ...settings.security.twoFactorAuth, enforceForAdmins: e.target.checked } } })}
                                            className="rounded text-orange-600"
                                        />
                                        <span className="text-sm font-medium">Enforce 2FA for ALL Admins</span>
                                    </label>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold mb-4 pt-4 border-t dark:text-white">Password Policy</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-sm font-medium">Min Length</span>
                                    <input
                                        type="number"
                                        value={settings.security?.passwordPolicy?.minLength || 8}
                                        onChange={(e) => setSettings({ ...settings, security: { ...settings.security, passwordPolicy: { ...settings.security.passwordPolicy, minLength: parseInt(e.target.value) } } })}
                                        className="mt-1 w-full bg-slate-50 p-2 border rounded-lg"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium">Expiry (Days)</span>
                                    <input
                                        type="number"
                                        value={settings.security?.passwordPolicy?.expiryDays || 90}
                                        onChange={(e) => setSettings({ ...settings, security: { ...settings.security, passwordPolicy: { ...settings.security.passwordPolicy, expiryDays: parseInt(e.target.value) } } })}
                                        className="mt-1 w-full bg-slate-50 p-2 border rounded-lg"
                                    />
                                </label>
                            </div>
                            <div className="pt-4 border-t mt-4 flex justify-end">
                                <button
                                    onClick={handleSystemSave}
                                    disabled={saving}
                                    className="bg-[#135bec] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
                                >
                                    {saving ? 'Saving...' : 'Save Policies'}
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* 5. MODULES (ADMIN) */}
                {
                    isAdmin && activeTab === 'modules' && (
                        <div className="space-y-6 max-w-2xl animate-fade-in">
                            {/* Payroll */}
                            <div className="border p-4 rounded-xl">
                                <h3 className="font-bold flex items-center justify-between">
                                    Payroll Integration
                                    <input
                                        type="checkbox"
                                        checked={settings.modules?.payroll?.enabled ?? true}
                                        onChange={(e) => setSettings({ ...settings, modules: { ...settings.modules, payroll: { ...settings.modules.payroll, enabled: e.target.checked } } })}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                </h3>
                                {settings.modules?.payroll?.enabled && (
                                    <div className="mt-3 grid gap-3">
                                        <label>
                                            <span className="text-sm text-slate-500">Provider</span>
                                            <select
                                                value={settings.modules?.payroll?.provider || 'Internal'}
                                                onChange={(e) => setSettings({ ...settings, modules: { ...settings.modules, payroll: { ...settings.modules.payroll, provider: e.target.value } } })}
                                                className="w-full bg-slate-50 p-2 border rounded"
                                            >
                                                <option>Internal</option>
                                                <option>Razorpay</option>
                                                <option>ADP</option>
                                                <option>Keka</option>
                                            </select>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Performance */}
                            <div className="border p-4 rounded-xl">
                                <h3 className="font-bold flex items-center justify-between">
                                    Performance Review
                                    <input
                                        type="checkbox"
                                        checked={settings.modules?.performance?.enabled ?? true}
                                        onChange={(e) => setSettings({ ...settings, modules: { ...settings.modules, performance: { ...settings.modules.performance, enabled: e.target.checked } } })}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                </h3>
                                <div className="mt-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={!settings.modules?.performance?.visibility?.employeeCanViewPeers}
                                            onChange={(e) => setSettings({ ...settings, modules: { ...settings.modules, performance: { ...settings.modules.performance, visibility: { employeeCanViewPeers: !e.target.checked } } } })}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Restrict Employees/Interns to view <b>SELF ONLY</b></span>
                                    </label>
                                </div>
                            </div>
                            <div className="pt-4 border-t mt-4 flex justify-end">
                                <button
                                    onClick={handleSystemSave}
                                    disabled={saving}
                                    className="bg-[#135bec] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
                                >
                                    {saving ? 'Saving...' : 'Save Modules'}
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* 6. HOLIDAYS (ADMIN) */}
                {
                    isAdmin && activeTab === 'holidays' && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold mb-4 dark:text-white">Holiday Calendar</h2>
                            <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm text-blue-800">
                                configure the annual holidays here. These dates will be blocked in the attendance system.
                            </div>

                            <div className="space-y-2">
                                {(settings.holidays || []).map((holiday: any, index: number) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="date"
                                            value={holiday.date ? new Date(holiday.date).toISOString().split('T')[0] : ''}
                                            onChange={(e) => {
                                                const newHolidays = [...settings.holidays];
                                                newHolidays[index].date = e.target.value;
                                                setSettings({ ...settings, holidays: newHolidays });
                                            }}
                                            className="border p-2 rounded"
                                        />
                                        <input
                                            type="text"
                                            value={holiday.name}
                                            onChange={(e) => {
                                                const newHolidays = [...settings.holidays];
                                                newHolidays[index].name = e.target.value;
                                                setSettings({ ...settings, holidays: newHolidays });
                                            }}
                                            className="border p-2 rounded flex-1"
                                            placeholder="Holiday Name"
                                        />
                                        <button
                                            onClick={() => {
                                                const newHolidays = settings.holidays.filter((_: any, i: number) => i !== index);
                                                setSettings({ ...settings, holidays: newHolidays });
                                            }}
                                            className="text-red-500 p-2"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setSettings({ ...settings, holidays: [...(settings.holidays || []), { date: new Date(), name: '', type: 'Public' }] })}
                                    className="text-[#135bec] font-bold text-sm flex items-center gap-1 mt-2"
                                >
                                    <span className="material-symbols-outlined">add</span> Add Holiday
                                </button>
                            </div>
                            <div className="pt-4 border-t mt-4 flex justify-end">
                                <button
                                    onClick={handleSystemSave}
                                    disabled={saving}
                                    className="bg-[#135bec] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
                                >
                                    {saving ? 'Saving...' : 'Save Calendar'}
                                </button>
                            </div>
                        </div>
                    )
                }

            </div>
        </div>

    );
}
