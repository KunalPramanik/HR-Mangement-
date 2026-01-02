'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { JOB_TITLES } from '@/lib/constants';

export default function AddEmployeePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneCode, setPhoneCode] = useState('+1');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [department, setDepartment] = useState('');
    const [position, setPosition] = useState('');
    const [role, setRole] = useState('');
    const [managerId, setManagerId] = useState('');
    const [hrManagerId, setHrManagerId] = useState('');
    const [managers, setManagers] = useState<any[]>([]);
    const [hrs, setHrs] = useState<any[]>([]);

    const [address, setAddress] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [coverPhoto, setCoverPhoto] = useState('');
    const [documents, setDocuments] = useState<{ name: string, url: string, type: string }[]>([]);
    const [uploading, setUploading] = useState(false);

    // Payroll State
    const [ctc, setCtc] = useState<number>(0);
    const [basic, setBasic] = useState<number>(0);
    const [hra, setHra] = useState<number>(0);
    const [da, setDa] = useState<number>(0);
    const [pf, setPf] = useState<number>(1800); // Standard min
    const [pt, setPt] = useState<number>(200); // Standard
    const [deductions, setDeductions] = useState<number>(0);

    // Bank State
    const [bankName, setBankName] = useState('');
    const [branchName, setBranchName] = useState('');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [isIfscValid, setIsIfscValid] = useState(false);

    // Auto-calculate Split
    useEffect(() => {
        if (ctc > 0) {
            const monthlyCtc = ctc / 12;
            const newBasic = Math.round(monthlyCtc * 0.50); // 50% of CTC
            const newHra = Math.round(newBasic * 0.40); // 40% of Basic
            const newDa = Math.round(monthlyCtc - newBasic - newHra - pf - pt); // Balance

            setBasic(newBasic);
            setHra(newHra);
            setDa(newDa > 0 ? newDa : 0);
        }
    }, [ctc, pf, pt]);

    // Geo-Fencing State
    const [workLat, setWorkLat] = useState<number | ''>('');
    const [workLng, setWorkLng] = useState<number | ''>('');
    const [workRadius, setWorkRadius] = useState<number>(200);
    const [geoEnabled, setGeoEnabled] = useState(false);

    const handleGeocode = async () => {
        if (!address) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setWorkLat(parseFloat(lat));
                setWorkLng(parseFloat(lon));
                alert(`Location found: ${lat}, ${lon}`);

                // Auto-enable for employees/interns if strictly required
                if (role === 'employee' || role === 'intern') {
                    setGeoEnabled(true);
                }
            } else {
                alert('Could not find coordinates for this address.');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to geocode address.');
        }
    };

    const handleFileUpload = async (file: File, type: 'profile' | 'cover' | 'document') => {
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                if (type === 'profile') setProfilePicture(data.url);
                if (type === 'cover') setCoverPhoto(data.url);
                if (type === 'document') {
                    setDocuments([...documents, { name: data.filename, url: data.url, type: data.type }]);
                }
            } else {
                alert('Upload failed: ' + data.error);
            }
        } catch (error) {
            console.error('Upload error', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        // Fetch potential managers and HRs
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Filter for Manager
                    const mgrs = data.filter((u: any) => u.role === 'manager' || u.role === 'director' || u.role === 'vp' || u.role === 'cxo' || u.role === 'cho');
                    setManagers(mgrs);
                    // Filter for HR
                    const hrList = data.filter((u: any) => u.role === 'hr');
                    setHrs(hrList);
                }
            })
            .catch(err => console.error(err));
    }, []);

    // ... (keep handleVerify, confirmOtp same) ... 

    // (Need to replicate handleVerify/confirmOtp here because I'm replacing a large block that includes them if I don't exclude them carefully. 
    // Actually, I should probably target specific blocks to avoid re-writing everything.
    // But since I'm inserting handleFileUpload before useEffect, let me just insert the function and state first.)

    // Changing strategy: Only update state and add handleFileUpload first.


    const [otpInput, setOtpInput] = useState('');
    const [otpSent, setOtpSent] = useState<'email' | 'phone' | null>(null);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);

    const handleVerify = (type: 'email' | 'phone') => {
        if (type === 'email' && !email) return alert('Please enter email first');
        if (type === 'phone' && !phoneNumber) return alert('Please enter phone number');

        setOtpSent(type);
        setOtpInput('');
        alert(`OTP sent to ${type === 'email' ? email : phoneNumber}. (Demo: Use 1234)`);
    };

    const confirmOtp = () => {
        if (otpInput === '1234') {
            if (otpSent === 'email') setIsEmailVerified(true);
            if (otpSent === 'phone') setIsPhoneVerified(true);
            setOtpSent(null);
            setOtpInput('');
            alert('Verified successfully!');
        } else {
            alert('Invalid OTP');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEmailVerified || !isPhoneVerified) {
            alert('Please verify both Email and Phone Number before submitting.');
            return;
        }

        setLoading(true);

        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ') || '.';

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phoneNumber: `${phoneCode} ${phoneNumber}`,
                    department,
                    position,
                    role,
                    managerId: managerId || undefined,
                    hrManagerId: hrManagerId || undefined,
                    address,
                    profilePicture,
                    coverPhoto,
                    documents,
                    workLocation: (workLat && workLng) ? {
                        latitude: Number(workLat),
                        longitude: Number(workLng),
                        radiusMeters: Number(workRadius)
                    } : null,
                    geoRestrictionEnabled: geoEnabled
                })
            });

            if (res.ok) {
                alert('Employee successfully added to database!');
                router.push('/hr/dashboard');
            } else {
                const err = await res.json();
                alert('Error: ' + err.error);
            }
        } catch (error) {
            alert('Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Add New Employee</h1>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></span>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                                placeholder="John Doe"
                            />
                        </label>

                        {/* Photo Uploads */}
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Photo</span>
                                <div className="mt-1 flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'profile')}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                                {profilePicture && <p className="text-xs text-green-600 mt-1 truncate">Uploaded ✓</p>}
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cover Photo</span>
                                <div className="mt-1 flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'cover')}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                                {coverPhoto && <p className="text-xs text-green-600 mt-1 truncate">Uploaded ✓</p>}
                            </label>
                        </div>

                        {/* Address & GPS */}
                        <div>
                            <label className="block mb-1">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Address / Location</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    // Auto-geocode on blur if user wants, or just use button
                                    onBlur={handleGeocode}
                                    className="flex-1 rounded-lg border border-slate-300 bg-slate-50 p-2.5"
                                    placeholder="e.g. 123 Main St, NY"
                                />
                                <button
                                    type="button"
                                    onClick={handleGeocode}
                                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold px-3 rounded-lg flex items-center gap-1"
                                    title="Convert Address to Coordinates"
                                >
                                    <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (navigator.geolocation) {
                                            navigator.geolocation.getCurrentPosition(
                                                (pos) => {
                                                    const { latitude, longitude } = pos.coords;
                                                    setWorkLat(latitude);
                                                    setWorkLng(longitude);
                                                    // Also set address if empty? optional.
                                                    alert('Current Location Fetched!');
                                                },
                                                (err) => alert('Error fetching location: ' + err.message)
                                            );
                                        } else {
                                            alert('Geolocation is not supported by this browser.');
                                        }
                                    }}
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold px-3 rounded-lg flex items-center gap-1"
                                    title="Use Current Device Location"
                                >
                                    <span className="material-symbols-outlined text-[18px]">my_location</span>
                                </button>
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <h3 className="font-bold text-gray-700 mb-3 dark:text-white">Attendance Restrictions (Geo-Fencing)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
                                    <input
                                        name="latitude"
                                        type="number"
                                        step="any"
                                        value={workLat}
                                        onChange={(e) => setWorkLat(parseFloat(e.target.value) || '')}
                                        placeholder="e.g. 28.6139"
                                        className="w-full p-2 border rounded-lg border-slate-300 bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
                                    <input
                                        name="longitude"
                                        type="number"
                                        step="any"
                                        value={workLng}
                                        onChange={(e) => setWorkLng(parseFloat(e.target.value) || '')}
                                        placeholder="e.g. 77.2090"
                                        className="w-full p-2 border rounded-lg border-slate-300 bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Radius (Meters)</label>
                                    <input
                                        name="radius"
                                        type="number"
                                        value={workRadius}
                                        onChange={(e) => setWorkRadius(parseInt(e.target.value) || 200)}
                                        placeholder="200"
                                        className="w-full p-2 border rounded-lg border-slate-300 bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div className="md:col-span-3 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="geoRestrictionEnabled"
                                        checked={geoEnabled}
                                        onChange={(e) => setGeoEnabled(e.target.checked)}
                                        className="size-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Fixed Office Location Restriction (Employees/Interns)</label>
                                </div>
                            </div>
                        </div>

                        {/* Email with Verification */}
                        <div>
                            <label className="block mb-1">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address <span className="text-red-500">*</span></span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setIsEmailVerified(false); }}
                                    className={`flex-1 rounded-lg border p-2.5 ${isEmailVerified ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50'}`}
                                    placeholder="john@company.com"
                                />
                                {isEmailVerified ? (
                                    <span className="flex items-center text-green-600 px-3 font-bold"><span className="material-symbols-outlined">check_circle</span></span>
                                ) : (
                                    <button type="button" onClick={() => handleVerify('email')} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 rounded-lg">Verify</button>
                                )}
                            </div>
                        </div>

                        {/* Phone with Verification & Flags */}
                        <div>
                            <label className="block mb-1">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number <span className="text-red-500">*</span></span>
                            </label>
                            <div className="flex gap-2">
                                <div className="flex flex-1">
                                    <select
                                        value={phoneCode}
                                        onChange={(e) => setPhoneCode(e.target.value)}
                                        className="rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-700 p-2.5 text-sm focus:ring-[#135bec] focus:border-[#135bec] outline-none min-w-[120px]"
                                    >
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+44">🇬🇧 +44</option>
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+61">🇦🇺 +61</option>
                                        <option value="+81">🇯🇵 +81</option>
                                        <option value="+86">🇨🇳 +86</option>
                                        <option value="+49">🇩🇪 +49</option>
                                        <option value="+33">🇫🇷 +33</option>
                                        <option value="+39">🇮🇹 +39</option>
                                        <option value="+7">🇷🇺 +7</option>
                                        <option value="+55">🇧🇷 +55</option>
                                        <option value="+971">🇦🇪 +971</option>
                                        <option value="+65">🇸🇬 +65</option>
                                    </select>
                                    <input
                                        type="tel"
                                        required
                                        value={phoneNumber}
                                        onChange={(e) => { setPhoneNumber(e.target.value); setIsPhoneVerified(false); }}
                                        className={`block w-full rounded-r-lg border p-2.5 outline-none ${isPhoneVerified ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50'}`}
                                        placeholder="555-123-4567"
                                    />
                                </div>
                                {isPhoneVerified ? (
                                    <span className="flex items-center text-green-600 px-3 font-bold"><span className="material-symbols-outlined">check_circle</span></span>
                                ) : (
                                    <button type="button" onClick={() => handleVerify('phone')} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 rounded-lg">Verify</button>
                                )}
                            </div>
                        </div>

                        {/* OTP Modal / Input Area */}
                        {otpSent && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-80">
                                    <h3 className="text-lg font-bold mb-4 dark:text-white">Enter OTP</h3>
                                    <p className="text-sm text-slate-500 mb-4">Sent to {otpSent === 'email' ? email : phoneNumber}</p>
                                    <input
                                        type="text"
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value)}
                                        className="w-full border rounded-lg p-3 text-center text-2xl tracking-widest mb-4"
                                        placeholder="0000"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setOtpSent(null)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold">Cancel</button>
                                        <button type="button" onClick={confirmOtp} className="flex-1 py-2 bg-[#135bec] text-white rounded-lg font-bold">Confirm</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Job Details</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Employee ID (Auto-generated)</span>
                            <input type="text" disabled value="MS-2024-XXXX" className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-100 text-slate-500 p-2.5 cursor-not-allowed" />
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block col-span-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Title / Position <span className="text-red-500">*</span></span>
                                <select
                                    required
                                    value={position}
                                    onChange={(e) => {
                                        const newPosition = e.target.value;
                                        setPosition(newPosition);

                                        // Auto-select Role based on Position
                                        const lowerPos = newPosition.toLowerCase();
                                        if (lowerPos.includes('chief') || lowerPos.includes('cxo') || lowerPos.includes('president') || lowerPos.includes('chairman') || lowerPos.includes('owner')) {
                                            setRole('cxo');
                                        } else if (lowerPos.includes('cho') || (lowerPos.includes('head') && lowerPos.includes('hr'))) {
                                            setRole('cho');
                                        } else if (lowerPos.includes('vp') || lowerPos.includes('vice president')) {
                                            setRole('vp');
                                        } else if (lowerPos.includes('director')) {
                                            setRole('director');
                                        } else if (lowerPos.includes('manager') || lowerPos.includes('lead') || lowerPos.includes('head')) {
                                            setRole('manager');
                                        } else if (lowerPos.includes('intern') || lowerPos.includes('trainee')) {
                                            setRole('intern');
                                        } else if (lowerPos.includes('hr') || lowerPos.includes('human resources')) {
                                            setRole('hr');
                                        } else if (lowerPos.includes('admin')) {
                                            setRole('admin');
                                        } else {
                                            setRole('employee');
                                        }
                                    }}
                                    className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                                >
                                    <option value="">Select Position</option>
                                    {JOB_TITLES.map((title) => (
                                        <option key={title} value={title}>{title}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Department <span className="text-red-500">*</span></span>
                                <select
                                    required
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                                >
                                    <option value="">Select Dept</option>
                                    <option>Engineering</option>
                                    <option>HR</option>
                                    <option>Sales</option>
                                    <option>Marketing</option>
                                    <option>Finance</option>
                                    <option>Operations</option>
                                    <option>Support</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">System Role <span className="text-red-500">*</span></span>
                                <select
                                    required
                                    value={role}
                                    onChange={(e) => {
                                        const r = e.target.value;
                                        setRole(r);
                                        // Auto-check geo for employee/intern
                                        if (r === 'employee' || r === 'intern') {
                                            setGeoEnabled(true);
                                        } else {
                                            setGeoEnabled(false);
                                        }
                                    }}
                                    className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                                >
                                    <option value="">Select Role</option>
                                    <option value="employee">Employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="hr">HR</option>
                                    <option value="admin">Admin</option>
                                    <option value="cho">CHO</option>
                                    <option value="cxo">CXO</option>
                                    <option value="vp">VP</option>
                                    <option value="director">Director</option>
                                    <option value="intern">Intern</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Reporting Manager</span>
                                <select
                                    value={managerId}
                                    onChange={(e) => setManagerId(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                                >
                                    <option value="">Select Manager</option>
                                    {managers.map((mgr) => (
                                        <option key={mgr._id} value={mgr._id}>
                                            {mgr.firstName} {mgr.lastName} ({mgr.position})
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Reporting HR</span>
                                <select
                                    value={hrManagerId}
                                    onChange={(e) => setHrManagerId(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                                >
                                    <option value="">Select HR</option>
                                    {hrs.map((hr) => (
                                        <option key={hr._id} value={hr._id}>
                                            {hr.firstName} {hr.lastName} ({hr.position})
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Payroll Structure (CTC & Breakdown)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block md:col-span-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Annual CTC <span className="text-red-500">*</span></span>
                            <div className="relative mt-1">
                                <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                                <input
                                    type="number"
                                    required
                                    value={ctc || ''}
                                    onChange={(e) => setCtc(parseFloat(e.target.value))}
                                    className="block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5 pl-8 font-bold text-lg"
                                    placeholder="600000"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Breakdown is auto-calculated based on 50% Basic rule.</p>
                        </label>

                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Basic Salary (Monthly)</label>
                                <input disabled value={basic} className="w-full bg-white dark:bg-slate-600 rounded border p-2 font-bold" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">HRA (40% of Basic)</label>
                                <input disabled value={hra} className="w-full bg-white dark:bg-slate-600 rounded border p-2 font-bold" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Special/DA (Balance)</label>
                                <input disabled value={da} className="w-full bg-white dark:bg-slate-600 rounded border p-2 font-bold" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Provident Fund (PF)</label>
                                <input type="number" value={pf} onChange={e => setPf(Number(e.target.value))} className="w-full bg-white dark:bg-slate-600 rounded border p-2 font-bold text-red-500" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Professional Tax (PT)</label>
                                <input type="number" value={pt} onChange={e => setPt(Number(e.target.value))} className="w-full bg-white dark:bg-slate-600 rounded border p-2 font-bold text-red-500" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Other Deductions</label>
                                <input type="number" value={deductions} onChange={e => setDeductions(Number(e.target.value))} className="w-full bg-white dark:bg-slate-600 rounded border p-2 font-bold text-red-500" />
                            </div>
                        </div>
                        <div className="md:col-span-2 flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
                            <span className="font-bold text-green-800 dark:text-green-300">Net Salary (In Hand)</span>
                            <span className="text-xl font-extrabold text-green-700 dark:text-green-400">₹{(basic + hra + da - pf - pt - deductions).toLocaleString()}/mo</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Bank Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Number</span>
                            <input
                                type="text"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                                placeholder="1234567890"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">IFSC Code</span>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={ifscCode}
                                    onChange={(e) => {
                                        setIfscCode(e.target.value.toUpperCase());
                                        setIsIfscValid(false); // Reset on change
                                    }}
                                    onBlur={async () => {
                                        if (ifscCode.length === 11) {
                                            try {
                                                const res = await fetch(`https://ifsc.razorpay.com/${ifscCode}`);
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    setBankName(data.BANK);
                                                    setBranchName(data.BRANCH);
                                                    setIsIfscValid(true);
                                                    // alert(`Bank Found: ${data.BANK}`);
                                                } else {
                                                    setBankName('');
                                                    setBranchName('');
                                                    setIsIfscValid(false);
                                                    alert('Invalid IFSC Code');
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert('Error fetching bank details');
                                            }
                                        }
                                    }}
                                    className={`mt-1 block w-full rounded-lg border p-2.5 uppercase ${isIfscValid ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50'}`}
                                    placeholder="HDFC0001234"
                                />
                                {isIfscValid && (
                                    <span className="absolute right-3 top-3 text-green-600">
                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    </span>
                                )}
                            </div>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Bank Name</span>
                            <input
                                type="text"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                                placeholder="HDFC Bank"
                                readOnly={isIfscValid} // Lock if auto-fetched, or allow edit? Usually lock or allow override. I'll leave writable but it gets auto-filled.
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Branch Name</span>
                            <input
                                type="text"
                                value={branchName}
                                onChange={(e) => setBranchName(e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 bg-slate-50 p-2.5"
                                placeholder="Indiranagar, Bangalore"
                            />
                        </label>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Documents</h2>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative">
                        <input
                            type="file"
                            multiple
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                                if (e.target.files) {
                                    Array.from(e.target.files).forEach(file => handleFileUpload(file, 'document'));
                                }
                            }}
                        />
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">cloud_upload</span>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Click to Upload Documents</p>
                        <p className="text-xs text-slate-500">Resume, ID Proof, Offer Letter</p>
                    </div>

                    {documents.length > 0 && (
                        <div className="mt-4 flex flex-col gap-2">
                            {documents.map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-500">description</span>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{doc.name}</p>
                                            <a href={doc.url} target="_blank" className="text-xs text-blue-600 hover:underline">View File</a>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setDocuments(documents.filter((_, i) => i !== idx))}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-[#135bec] text-white font-bold p-4 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                    {loading ? 'Creating...' : 'Create Employee Profile'}
                </button>
            </form >
        </div >
    );
}
