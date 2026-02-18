'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { JOB_TITLES } from '@/lib/constants';
import { toast } from 'sonner';

// Define the steps and their labels
const STEPS = [
    { id: 1, label: 'Personal', icon: 'person' },
    { id: 2, label: 'Contact', icon: 'call' },
    { id: 3, label: 'Job', icon: 'work' },
    { id: 4, label: 'Compensation', icon: 'payments' },
    { id: 5, label: 'Experience', icon: 'school' },
    { id: 6, label: 'Docs', icon: 'upload_file' },
    { id: 7, label: 'IT Access', icon: 'security' },
];

export default function AddEmployeePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // --- 1. Basic Personal Information ---
    const [fullName, setFullName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('Male');
    const [nationality, setNationality] = useState('Indian');
    const [maritalStatus, setMaritalStatus] = useState('Single');
    const [bloodGroup, setBloodGroup] = useState('');
    const [aadhaar, setAadhaar] = useState('');
    const [pan, setPan] = useState('');
    const [passportNumber, setPassportNumber] = useState('');
    const [passportExpiry, setPassportExpiry] = useState('');

    // --- 2. Contact Information ---
    const [personalEmail, setPersonalEmail] = useState('');
    const [officialEmail, setOfficialEmail] = useState('');
    const [phoneCode, setPhoneCode] = useState('+91');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [currentAddress, setCurrentAddress] = useState('');
    const [permanentAddress, setPermanentAddress] = useState('');
    const [sameAsCurrent, setSameAsCurrent] = useState(false); // Checkbox state
    const [emergencyContactName, setEmergencyContactName] = useState('');
    const [emergencyContactRelation, setEmergencyContactRelation] = useState('');
    const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
    const [medicalConditions, setMedicalConditions] = useState('');

    // --- 3. Job & Employment Details ---
    const [employeeId, setEmployeeId] = useState('');
    const [department, setDepartment] = useState('');
    const [position, setPosition] = useState('');
    const [role, setRole] = useState('employee');
    const [employeeType, setEmployeeType] = useState('Full-time');
    const [employmentStatus, setEmploymentStatus] = useState('Active');
    const [dateOfJoining, setDateOfJoining] = useState(new Date().toISOString().split('T')[0]);
    const [probationPeriod, setProbationPeriod] = useState(6);
    const [confirmationDate, setConfirmationDate] = useState('');
    const [managerId, setManagerId] = useState('');
    const [hrManagerId, setHrManagerId] = useState('');
    const [workLocationName, setWorkLocationName] = useState('Head Office');
    const [workLat, setWorkLat] = useState<number | ''>('');
    const [workLng, setWorkLng] = useState<number | ''>('');
    const [workRadius, setWorkRadius] = useState<number>(200);
    const [geoEnabled, setGeoEnabled] = useState(false);
    const [shiftType, setShiftType] = useState('General');
    const [grade, setGrade] = useState('');

    // --- 4. Compensation Details (CTC Breakdown) ---
    const [ctc, setCtc] = useState<number>(0);
    const [basic, setBasic] = useState<number>(0);
    const [hra, setHra] = useState<number>(0);
    const [da, setDa] = useState<number>(0);
    const [pf, setPf] = useState<number>(1800);
    const [pt, setPt] = useState<number>(200);
    const [specialAllowance, setSpecialAllowance] = useState<number>(0);
    const [deductions, setDeductions] = useState<number>(0);

    // --- 5. Bank & Statutory ---
    const [bankName, setBankName] = useState('');
    const [branchName, setBranchName] = useState('');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [uan, setUan] = useState('');
    const [esiNumber, setEsiNumber] = useState('');
    const [pfNumber, setPfNumber] = useState('');
    const [taxDeclarationStatus, setTaxDeclarationStatus] = useState('Pending');

    // --- 6. Education & Exp ---
    const [education, setEducation] = useState<{ qualification: string, institution: string, yearOfPassing: string, grade: string }[]>([
        { qualification: '', institution: '', yearOfPassing: '', grade: '' }
    ]);
    const [experience, setExperience] = useState<{ companyName: string, designation: string, startDate: string, endDate: string, lastSalary: string, reason: string }[]>([]);

    // --- 8. Documents & System ---
    const [documents, setDocuments] = useState<{ name: string, url: string, type: string }[]>([]);
    const [profilePicture, setProfilePicture] = useState('');
    const [softwareAccess, setSoftwareAccess] = useState<string[]>([]);

    // Auxiliary State
    const [managers, setManagers] = useState<any[]>([]);
    const [hrs, setHrs] = useState<any[]>([]);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Load Managers/HRs
    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setManagers(data.filter((u: any) => ['manager', 'director', 'vp', 'cxo', 'cho'].includes(u.role)));
                    setHrs(data.filter((u: any) => u.role === 'hr'));
                }
            })
            .catch(err => console.error(err));
    }, []);

    // Sync Address Logic
    useEffect(() => {
        if (sameAsCurrent) {
            setPermanentAddress(currentAddress);
        }
    }, [sameAsCurrent, currentAddress]);

    // Auto-calculate Salary Split
    useEffect(() => {
        if (ctc > 0) {
            const monthlyCtc = ctc / 12;
            const newBasic = Math.round(monthlyCtc * 0.50);
            const newHra = Math.round(newBasic * 0.40);
            const newDa = 0;
            const balance = monthlyCtc - newBasic - newHra - pf - pt;
            setBasic(newBasic);
            setHra(newHra);
            setDa(newDa);
            setSpecialAllowance(balance > 0 ? balance : 0);
        }
    }, [ctc, pf, pt]);

    // Generate Password on load
    useEffect(() => {
        setGeneratedPassword(`Mindstar@${new Date().getFullYear()}`);
    }, []);

    const handleFileUpload = async (file: File, type: string, customName?: string) => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) {
                if (type === 'profile') setProfilePicture(data.url);
                else {
                    setDocuments(prev => [...prev, { name: customName || file.name, url: data.url, type: type }]);
                    toast.success(`${type} uploaded successfully`);
                }
            } else {
                toast.error('Upload failed: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setWorkLat(position.coords.latitude);
                    setWorkLng(position.coords.longitude);
                    toast.success('Location fetched!');
                },
                (error) => toast.error('Error fetching location: ' + error.message)
            );
        } else {
            toast.error("Geolocation is not supported by this browser.");
        }
    };

    const validateStep = (step: number) => {
        if (step === 1) {
            if (!fullName) return toast.error('Full Name is required');
            if (dateOfBirth && new Date(dateOfBirth) > new Date()) return toast.error('Date of Birth cannot be in the future');
        }
        if (step === 2) {
            if (!officialEmail && !personalEmail) return toast.error('At least one Email is required');
            if (!phoneNumber) return toast.error('Phone Number is required');
        }
        if (step === 3) {
            if (!department) return toast.error('Department is required');
            if (!position) return toast.error('Designation is required');
            if (!dateOfJoining) return toast.error('Date of Joining is required');
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        setLoading(true);

        // Filter empty rows
        const cleanEducation = education.filter(e => e.qualification && e.institution);
        const cleanExperience = experience.filter(e => e.companyName);

        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ') || '.';

        const payload = {
            firstName, lastName,
            email: officialEmail || personalEmail,
            password: generatedPassword, // Explicitly sending generated password
            role,
            employeeId: employeeId || undefined,
            fatherName, motherName,
            gender, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            nationality, maritalStatus, bloodGroup,
            aadhaar,
            pan,
            passportDetails: (passportNumber) ? { number: passportNumber, expiryDate: passportExpiry } : undefined,
            profilePicture,
            phoneNumber: `${phoneCode} ${phoneNumber}`,
            personalEmail,
            officialEmail,
            currentAddress,
            permanentAddress,
            emergencyContact: {
                name: emergencyContactName,
                relationship: emergencyContactRelation,
                phoneNumber: emergencyContactPhone
            },
            department, position,
            employeeType, employmentStatus,
            dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
            probationPeriod,
            managerId: managerId || undefined,
            hrManagerId: hrManagerId || undefined,
            workLocation: (workLat && workLng) ? {
                name: workLocationName,
                latitude: Number(workLat),
                longitude: Number(workLng),
                radiusMeters: Number(workRadius)
            } : undefined,
            shiftType, grade,
            geoRestrictionEnabled: geoEnabled,
            salaryInfo: {
                ctc: String(ctc),
                basic: String(basic),
                hra: String(hra),
                da: String(da),
                pf: String(pf),
                pt: String(pt),
                specialAllowance: String(specialAllowance),
                deductions: String(deductions),
                netSalary: String(basic + hra + da + specialAllowance - pf - pt - deductions)
            },
            bankInfo: {
                bankName, branchName, accountName, accountNumber, ifscCode
            },
            statutoryInfo: {
                pan, uan, pfNumber, esiNumber, taxDeclarationStatus
            },
            education: cleanEducation,
            previousEmployment: cleanExperience,
            documents,
            medicalConditions,
            softwareAccess
        };

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                // If API returns a generated Employee ID, use it for display
                if (data.user?.employeeId) setEmployeeId(data.user.employeeId);
                setShowSuccessModal(true);
            } else {
                toast.error('Error: ' + data.error);
            }
        } catch (error) {
            toast.error('Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-30">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Onboard Employee</h1>
                            <p className="text-xs text-slate-500 font-medium">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6">

                {/* Stepper Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden sticky top-24">
                        {STEPS.map((step) => (
                            <button
                                key={step.id}
                                onClick={() => validateStep(currentStep) && setCurrentStep(step.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-4 ${currentStep === step.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-600'
                                        : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[20px] ${currentStep === step.id ? 'filled' : ''}`}>{step.icon}</span>
                                {step.label}
                                {currentStep > step.id && <span className="material-symbols-outlined text-green-500 text-[16px] ml-auto">check_circle</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Form Content */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:p-8">

                    {/* Step 1: Personal */}
                    {currentStep === 1 && (
                        <div className="animate-fadeIn space-y-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">person</span> Personal Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Full Legal Name *" value={fullName} onChange={setFullName} required placeholder="As per ID Proof" />
                                <div className="flex gap-4">
                                    <Input label="Father's Name" value={fatherName} onChange={setFatherName} />
                                    <Input label="Mother's Name" value={motherName} onChange={setMotherName} />
                                </div>
                                <Input label="Date of Birth" type="date" value={dateOfBirth} onChange={setDateOfBirth} />
                                <Select label="Gender" value={gender} onChange={setGender} options={['Male', 'Female', 'Other']} />
                                <Select label="Marital Status" value={maritalStatus} onChange={setMaritalStatus} options={['Single', 'Married', 'Divorced']} />
                                <Input label="Nationality" value={nationality} onChange={setNationality} />
                                <Input label="Blood Group" value={bloodGroup} onChange={setBloodGroup} placeholder="O+" />
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 border-dashed">
                                    <Input label="Aadhaar Number" value={aadhaar} onChange={setAadhaar} placeholder="12 Digit UID" />
                                    <Input label="PAN Number" value={pan} onChange={setPan} placeholder="Permanent Account Number" />
                                    <div className="flex gap-2">
                                        <Input label="Passport No" value={passportNumber} onChange={setPassportNumber} />
                                        <Input label="Expiry" type="date" value={passportExpiry} onChange={setPassportExpiry} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact */}
                    {currentStep === 2 && (
                        <div className="animate-fadeIn space-y-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">call</span> Contact Info
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Personal Email" type="email" value={personalEmail} onChange={setPersonalEmail} />
                                <Input label="Official Email" type="email" value={officialEmail} onChange={setOfficialEmail} />
                                <Input label="Mobile Number *" value={phoneNumber} onChange={setPhoneNumber} required prefix={phoneCode} />

                                <div className="md:col-span-2">
                                    <Input label="Current Address" value={currentAddress} onChange={setCurrentAddress} multiline />
                                </div>
                                <div className="md:col-span-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Permanent Address</span>
                                        <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                                            <input type="checkbox" checked={sameAsCurrent} onChange={(e) => setSameAsCurrent(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                            Same as Current
                                        </label>
                                    </div>
                                    <textarea
                                        value={permanentAddress}
                                        onChange={e => setPermanentAddress(e.target.value)}
                                        disabled={sameAsCurrent}
                                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500"
                                        rows={3}
                                    />
                                </div>

                                <div className="md:col-span-2 border-t pt-4 mt-2">
                                    <h4 className="font-semibold mb-3 text-sm uppercase text-slate-500">Emergency Contact</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input label="Contact Name" value={emergencyContactName} onChange={setEmergencyContactName} />
                                        <Input label="Relationship" value={emergencyContactRelation} onChange={setEmergencyContactRelation} />
                                        <Input label="Phone" value={emergencyContactPhone} onChange={setEmergencyContactPhone} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Job */}
                    {currentStep === 3 && (
                        <div className="animate-fadeIn space-y-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">work</span> Job Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input label="Employee ID" value={employeeId} placeholder="Auto-generated e.g. MS-2024-001" disabled />
                                <Input label="Date of Joining *" type="date" value={dateOfJoining} onChange={setDateOfJoining} required />
                                <Select label="Employment Type" value={employeeType} onChange={setEmployeeType} options={['Full-time', 'Part-time', 'Contract', 'Intern']} />

                                <Select label="Department *" value={department} onChange={setDepartment} options={['Engineering', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations']} required />
                                <Select label="Designation *" value={position} onChange={setPosition} options={JOB_TITLES} required />
                                <Select label="System Role" value={role} onChange={setRole} options={['employee', 'manager', 'hr', 'admin', 'cxo', 'intern']} />

                                <Select label="Reporting Manager" value={managerId} onChange={setManagerId} options={managers.map(m => ({ label: `${m.firstName} ${m.lastName}`, value: m._id }))} />
                                <Select label="HR Manager" value={hrManagerId} onChange={setHrManagerId} options={hrs.map(h => ({ label: `${h.firstName} ${h.lastName}`, value: h._id }))} />

                                <Input label="Probation (Months)" type="number" value={probationPeriod} onChange={setProbationPeriod} />

                                <div className="md:col-span-3 border-t pt-4 mt-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-slate-700">Work Location (Geo-fencing)</span>
                                        <button type="button" onClick={handleCurrentLocation} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                                            <span className="material-symbols-outlined text-[14px]">my_location</span> Get Current Location
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <Input label="Office Name" value={workLocationName} onChange={setWorkLocationName} />
                                        <Input label="Latitude" value={workLat} onChange={setWorkLat} type="number" />
                                        <Input label="Longitude" value={workLng} onChange={setWorkLng} type="number" />
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <input type="checkbox" checked={geoEnabled} onChange={e => setGeoEnabled(e.target.checked)} className="rounded" />
                                        <span className="text-sm">Enable Geo-restriction for Attendance</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Compensation */}
                    {currentStep === 4 && (
                        <div className="animate-fadeIn space-y-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">payments</span> Salary & Bank
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Input label="Annual CTC (₹)" type="number" value={ctc} onChange={setCtc} className="text-xl font-bold" />
                                    <p className="text-xs text-gray-500 mt-1">Basic = 50% of CTC, HRA = 40% of Basic</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg grid grid-cols-2 gap-4 border border-slate-200 dark:border-slate-700">
                                    <Input label="Basic (Monthly)" value={basic} disabled />
                                    <Input label="HRA" value={hra} disabled />
                                    <Input label="Special Allowance" value={specialAllowance} disabled />
                                    <Input label="PF Deduct" value={pf} onChange={setPf} type="number" />
                                    <Input label="Prof Tax" value={pt} onChange={setPt} type="number" />
                                    <div className="col-span-2 text-right border-t pt-2 mt-2">
                                        <span className="block text-sm text-gray-500">Net Monthly Salary</span>
                                        <span className="text-xl font-bold text-green-600">₹{(basic + hra + da + specialAllowance - pf - pt - deductions).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 border-t pt-4 border-dashed">
                                <h4 className="font-semibold mb-3 text-sm uppercase text-slate-500">Bank Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input label="Bank Name" value={bankName} onChange={setBankName} />
                                    <Input label="Account Number" value={accountNumber} onChange={setAccountNumber} />
                                    <Input label="IFSC Code" value={ifscCode} onChange={setIfscCode} />
                                    <Input label="UAN" value={uan} onChange={setUan} />
                                    <Input label="PF Number" value={pfNumber} onChange={setPfNumber} />
                                    <Input label="ESI Number" value={esiNumber} onChange={setEsiNumber} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Experience */}
                    {currentStep === 5 && (
                        <div className="animate-fadeIn space-y-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">school</span> Education & Experience
                            </h2>
                            <div className="space-y-4">
                                <h4 className="font-bold border-b pb-2">Education Qualifications</h4>
                                {education.map((edu, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end bg-slate-50 p-3 rounded-lg">
                                        <Input label="Degree" value={edu.qualification} onChange={(v: string) => { const n = [...education]; n[idx].qualification = v; setEducation(n) }} placeholder="B.Tech" />
                                        <Input label="Institution" value={edu.institution} onChange={(v: string) => { const n = [...education]; n[idx].institution = v; setEducation(n) }} />
                                        <Input label="Year" value={edu.yearOfPassing} onChange={(v: string) => { const n = [...education]; n[idx].yearOfPassing = v; setEducation(n) }} />
                                        <Input label="Grade" value={edu.grade} onChange={(v: string) => { const n = [...education]; n[idx].grade = v; setEducation(n) }} />
                                        <button type="button" onClick={() => setEducation(education.filter((_, i) => i !== idx))} className="md:mb-2 text-red-500 hover:bg-red-50 p-2 rounded"><span className="material-symbols-outlined">delete</span></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setEducation([...education, { qualification: '', institution: '', yearOfPassing: '', grade: '' }])} className="text-sm font-bold text-blue-600">+ Add Education</button>
                            </div>

                            <div className="space-y-4 mt-8">
                                <h4 className="font-bold border-b pb-2">Previous Employment</h4>
                                {experience.map((exp, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end bg-slate-50 p-3 rounded-lg">
                                        <Input label="Company" value={exp.companyName} onChange={(v: string) => { const n = [...experience]; n[idx].companyName = v; setExperience(n) }} />
                                        <Input label="Role" value={exp.designation} onChange={(v: string) => { const n = [...experience]; n[idx].designation = v; setExperience(n) }} />
                                        <Input label="From" type="date" value={exp.startDate} onChange={(v: string) => { const n = [...experience]; n[idx].startDate = v; setExperience(n) }} />
                                        <Input label="To" type="date" value={exp.endDate} onChange={(v: string) => { const n = [...experience]; n[idx].endDate = v; setExperience(n) }} />
                                        <Input label="Salary" value={exp.lastSalary} onChange={(v: string) => { const n = [...experience]; n[idx].lastSalary = v; setExperience(n) }} />
                                        <button type="button" onClick={() => setExperience(experience.filter((_, i) => i !== idx))} className="md:mb-2 text-red-500 hover:bg-red-50 p-2 rounded"><span className="material-symbols-outlined">delete</span></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setExperience([...experience, { companyName: '', designation: '', startDate: '', endDate: '', lastSalary: '', reason: '' }])} className="text-sm font-bold text-blue-600">+ Add Experience</button>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Documents */}
                    {currentStep === 6 && (
                        <div className="animate-fadeIn space-y-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">upload_file</span> Documents
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['Resume', 'ID Proof', 'Address Proof', 'Offer Letter', 'Appointment Letter', 'NDA', 'Photo'].map((docType) => (
                                    <div key={docType} className={`border-2 border-dashed p-4 rounded-xl flex flex-col items-center justify-center text-center hover:bg-slate-50 relative transition-colors ${documents.find(d => d.type === docType) ? 'border-green-300 bg-green-50' : 'border-slate-300'}`}>
                                        <span className="text-sm font-semibold mb-2 text-slate-700">{docType}</span>
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], docType)} />
                                        {documents.find(d => d.type === docType) ? (
                                            <div className="text-green-600 flex flex-col items-center">
                                                <span className="material-symbols-outlined text-[24px]">check_circle</span>
                                                <span className="text-xs font-bold">Uploaded</span>
                                            </div>
                                        ) : (
                                            <div className="text-slate-400 flex flex-col items-center">
                                                <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                                                <span className="text-xs">Click to Upload</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 7: IT Access */}
                    {currentStep === 7 && (
                        <div className="animate-fadeIn space-y-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">security</span> IT & System Access
                            </h2>
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm mb-4">
                                <span className="font-bold">Generated Credentials:</span> The user will use their official email and the default password below to login.
                                <div className="mt-2 font-mono bg-white p-2 rounded border border-yellow-200 inline-block">
                                    {generatedPassword}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-3">Software Access Required</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['Slack', 'Jira', 'GitHub', 'Figma', 'AWS', 'Zoom', 'Notion', 'Office 365'].map(tool => (
                                        <label key={tool} className={`flex items-center gap-2 border px-3 py-2 rounded-lg cursor-pointer transition-colors ${softwareAccess.includes(tool) ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}>
                                            <input type="checkbox"
                                                checked={softwareAccess.includes(tool)}
                                                onChange={e => {
                                                    if (e.target.checked) setSoftwareAccess([...softwareAccess, tool]);
                                                    else setSoftwareAccess(softwareAccess.filter(t => t !== tool));
                                                }}
                                                className="rounded text-blue-600"
                                            />
                                            <span className="text-sm font-medium text-slate-700">{tool}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <Input label="Medical Conditions (Optional)" value={medicalConditions} onChange={setMedicalConditions} multiline />
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="px-6 py-2 rounded-lg border border-slate-300 font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                        >
                            Back
                        </button>

                        {currentStep < STEPS.length ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-6 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white font-bold hover:bg-slate-800 flex items-center gap-2"
                            >
                                Next Step <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-500/30 flex items-center gap-2 disabled:opacity-70"
                            >
                                {loading ? 'Creating...' : 'Create Employee Profile'}
                                <span className="material-symbols-outlined text-[18px]">check</span>
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center m-4">
                        <div className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl">check_circle</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Success!</h2>
                        <p className="text-slate-500 mb-6">Employee profile has been created successfully.</p>

                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-6 text-left border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Employee ID</p>
                            <p className="text-lg font-mono font-bold text-slate-900 dark:text-white mb-3">{employeeId || 'Generating...'}</p>

                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Temporary Password</p>
                            <div className="flex justify-between items-center">
                                <code className="text-lg font-mono font-bold text-blue-600">{generatedPassword}</code>
                                <button onClick={() => { navigator.clipboard.writeText(generatedPassword); toast.success('Copied') }} className="text-slate-400 hover:text-blue-600">
                                    <span className="material-symbols-outlined">content_copy</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => router.push('/hr/employees')} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">
                                Directory
                            </button>
                            <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                Add Another
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Reusable Components (Keep these clean) ---

function Input({ label, value, onChange, type = 'text', required, className = '', placeholder, prefix, disabled, multiline }: any) {
    return (
        <label className="block w-full">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">{label}</span>
            <div className="flex">
                {prefix && (
                    <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 bg-slate-100 text-slate-500 sm:text-sm rounded-l-md">
                        {prefix}
                    </span>
                )}
                {multiline ? (
                    <textarea
                        required={required}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-white dark:bg-slate-800 disabled:bg-slate-100 ${className} ${prefix ? 'rounded-l-none' : ''}`}
                        rows={3}
                    />
                ) : (
                    <input
                        type={type}
                        required={required}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-white dark:bg-slate-800 disabled:bg-slate-100 ${className} ${prefix ? 'rounded-l-none' : ''}`}
                    />
                )}
            </div>
        </label>
    );
}

function Select({ label, value, onChange, options, required }: any) {
    return (
        <label className="block w-full">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">{label}</span>
            <select
                required={required}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-white dark:bg-slate-800"
            >
                <option value="">Select...</option>
                {options.map((opt: any) => (
                    typeof opt === 'object' ?
                        <option key={opt.value} value={opt.value}>{opt.label}</option> :
                        <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </label>
    );
}
