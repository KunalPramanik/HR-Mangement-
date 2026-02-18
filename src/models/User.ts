import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    // 1. Core Identity & Multi-tenancy
    organizationId: mongoose.Types.ObjectId;
    tenantId?: mongoose.Types.ObjectId;
    employeeId: string;
    email: string;
    password: string;

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;

    // 1.2 RBAC & Roles
    role: 'employee' | 'manager' | 'hr' | 'admin' | 'cho' | 'cxo' | 'director' | 'vp' | 'intern' | 'cfo';
    roleId?: mongoose.Types.ObjectId;
    accessApprovalStatus: 'Pending' | 'Approved' | 'Rejected';
    softwareAccess?: string[];

    // 2. Basic Personal Information
    firstName: string;
    middleName?: string;
    lastName: string;
    fatherName?: string;
    motherName?: string;

    gender?: 'Male' | 'Female' | 'Other';
    dateOfBirth?: Date;
    maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    bloodGroup?: string;
    nationality?: string;

    // Identity
    aadhaar?: string;
    pan?: string;
    passportDetails?: {
        number: string;
        expiryDate: Date;
    };
    governmentIdType?: string;
    governmentIdNumber?: string;

    profilePicture?: string;
    coverPhoto?: string;

    // 3. Contact Information
    phoneNumber?: string;
    personalEmail?: string;
    officialEmail?: string;
    currentAddress?: string;
    permanentAddress?: string;
    emergencyContact?: {
        name: string;
        relationship: string;
        phoneNumber: string;
    };

    // 4. Job Details
    position: string;
    department: string;
    businessUnit?: string;
    managerId?: mongoose.Types.ObjectId;
    hrManagerId?: mongoose.Types.ObjectId;

    employeeType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern' | 'Freelance';
    employmentStatus: 'Active' | 'On Leave' | 'Terminated' | 'Resigned' | 'Probation' | 'Notice Period' | 'Suspended';
    suspensionReason?: string;

    dateOfJoining: Date;
    probationPeriod?: number; // in months
    confirmationDate?: Date;

    // Location & Shift
    workLocationId?: mongoose.Types.ObjectId;
    workLocation?: {
        name?: string;
        latitude: number;
        longitude: number;
        radiusMeters: number;
    };
    shiftType?: string;
    grade?: string;
    costCenter?: string;

    // 5. Compensation Details
    salaryInfo?: {
        ctc: string;
        basic: string;
        hra: string;
        allowances?: string;
        da: string;
        pf: string;
        esi: string;
        pt: string;
        specialAllowance?: string;
        bonus?: string;
        deductions: string;
        netSalary?: string;
    };
    bankInfo?: {
        bankName: string;
        accountName: string;
        accountNumber: string;
        ifscCode: string;
        branchName?: string;
    };
    statutoryInfo?: {
        pan: string;
        uan?: string;
        pfNumber?: string;
        esiNumber?: string;
        esicNum?: string; // Legacy field
        taxDeclarationStatus?: 'Pending' | 'Submitted' | 'Verified';
        pfEnabled: boolean;
    };

    // 6. Educational Details
    education?: {
        qualification: string;
        institution: string;
        yearOfPassing: string;
        grade?: string;
        scanUrl?: string;
    }[];

    certifications?: {
        name: string;
        issuer: string;
        date: Date;
        expiryDate?: Date;
        url?: string;
    }[];
    skills?: string[];

    // 7. Previous Employment
    previousEmployment?: {
        companyName: string;
        designation: string;
        startDate: Date;
        endDate: Date;
        lastDrawnSalary?: string;
        reasonForLeaving?: string;
        experienceLetterUrl?: string;
        verified?: boolean;
    }[];

    // 8. Documents
    documents?: {
        name: string;
        type: string;
        url: string;
        expiryDate?: Date;
        uploadedAt?: Date;
        verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
    }[];

    // 9. Emergency & Compliance
    medicalConditions?: string;
    backgroundVerification?: {
        status: 'Pending' | 'In Progress' | 'Clear' | 'Failed' | 'Not Required';
        agencyName?: string;
        reportUrl?: string;
        completionDate?: Date;
    };
    policeVerification?: {
        status: 'Pending' | 'Clear' | 'Failed' | 'Not Required';
        referenceNumber?: string;
    };

    assets?: {
        assetId: string;
        type: string;
        name: string;
        allocatedDate: Date;
        returnDate?: Date;
        status: 'Allocated' | 'Returned' | 'Lost' | 'Damaged';
    }[];

    // Job History / Audit
    jobHistory?: {
        changeDate: Date;
        fieldChanged: string;
        oldValue: string | number | any;
        newValue: string | number | any;
        reason?: string;
        updatedBy?: mongoose.Types.ObjectId;
    }[];

    // System Flags
    isActive: boolean;
    geoRestrictionEnabled?: boolean;

    auditLogRef?: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;

    webauthnLoginToken?: string;
    webauthnLoginExpires?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Organization' },

        // 1. Core Identity & Access
        employeeId: { type: String, required: true, trim: true, unique: true }, // Auto-generated ideal but explicit here
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },

        // 1.2 Role & Permissions (RBAC)
        role: {
            type: String,
            enum: ['employee', 'manager', 'hr', 'intern', 'admin', 'cho', 'cxo', 'director', 'vp', 'cfo'],
            default: 'employee',
        },
        roleId: { type: Schema.Types.ObjectId, ref: 'Role' },
        accessApprovalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
        softwareAccess: [String], // List of software tools access required/granted

        // 2. Basic Personal Information (Mandatory)
        firstName: { type: String, required: true, trim: true },
        middleName: { type: String, trim: true },
        lastName: { type: String, required: true, trim: true },
        fatherName: { type: String, trim: true },
        motherName: { type: String, trim: true },

        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        dateOfBirth: Date,
        nationality: String,
        maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },
        bloodGroup: String,

        // Identity Documents
        aadhaar: String, // Government ID Number (Generic field usage or specific)
        pan: String,     // Tax ID
        passportDetails: {
            number: String,
            expiryDate: Date
        },
        governmentIdType: { type: String, default: 'Aadhaar' }, // To specify which ID is stored if not strictly Aadhaar
        governmentIdNumber: String, // If not using specific fields above

        profilePicture: String,
        coverPhoto: String,

        // 3. Contact Information
        phoneNumber: String, // Mobile Number
        personalEmail: String,
        officialEmail: String,
        currentAddress: String,
        permanentAddress: String,
        emergencyContact: {
            name: String,
            relationship: String,
            phoneNumber: String,
        },

        // 4. Job & Employment Details (Core HR)
        position: { type: String, required: true }, // Job Title / Designation
        department: { type: String, required: true },
        businessUnit: String,
        managerId: { type: Schema.Types.ObjectId, ref: 'User' }, // Reporting Manager
        hrManagerId: { type: Schema.Types.ObjectId, ref: 'User' },

        employeeType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Freelance'], default: 'Full-time' },
        employmentStatus: {
            type: String,
            enum: ['Active', 'On Leave', 'Terminated', 'Resigned', 'Probation', 'Notice Period', 'Suspended'],
            default: 'Active'
        },
        suspensionReason: String,

        dateOfJoining: { type: Date, required: true },
        probationPeriod: { type: Number, default: 0 }, // in months
        confirmationDate: Date,

        workLocationId: { type: Schema.Types.ObjectId, ref: 'Organization.locations' },
        workLocation: { // Snapshot or Override
            name: String,
            latitude: Number,
            longitude: Number,
            radiusMeters: Number,
        },
        shiftType: String, // Shift Details
        grade: String,     // Band/Grade
        costCenter: String,

        // 5. Compensation Details (Critical)
        salaryInfo: {
            ctc: { type: String }, // Cost to Company
            basic: { type: String },
            hra: { type: String },
            allowances: { type: String }, // Generic allowances
            da: { type: String },
            pf: { type: String }, // PF Number usually stored in statutory
            esi: { type: String },
            pt: { type: String },
            specialAllowance: { type: String },
            bonus: { type: String }, // Bonus Structure
            deductions: { type: String },
            netSalary: { type: String }
        },

        bankInfo: {
            bankName: { type: String },
            accountName: { type: String },
            accountNumber: { type: String },
            ifscCode: { type: String },
            branchName: { type: String }
        },

        statutoryInfo: {
            pan: { type: String }, // PAN Number
            uan: { type: String }, // Universal Account Number
            pfNumber: { type: String },
            esiNumber: { type: String },
            taxDeclarationStatus: { type: String, enum: ['Pending', 'Submitted', 'Verified'], default: 'Pending' },
            pfEnabled: { type: Boolean, default: true }
        },

        // 6. Educational Details
        education: [{
            qualification: String, // Highest Qualification, Degree Name
            institution: String,   // University / Institution
            yearOfPassing: String,
            grade: String,         // Percentage / CGPA
            scanUrl: String        // Document link if separate
        }],

        certifications: [{
            name: String,
            issuer: String,
            date: Date,
            expiryDate: Date,
            url: String
        }],
        skills: [String],

        // 7. Previous Employment (If Experienced Hire)
        previousEmployment: [{
            companyName: String,
            designation: String,
            startDate: Date,
            endDate: Date,
            lastDrawnSalary: String,
            reasonForLeaving: String,
            experienceLetterUrl: String, // "Experience Letter Uploaded" check
            verified: { type: Boolean, default: false }
        }],

        // 8. Documents Upload Section
        documents: [{
            name: String, // e.g., "Resume", "Offer Letter"
            type: { type: String, enum: ['Resume', 'ID Proof', 'Address Proof', 'Education', 'Offer Letter', 'Appointment Letter', 'NDA', 'Contract', 'Cheque', 'Photo', 'Other'] },
            url: String,
            expiryDate: Date,
            uploadedAt: { type: Date, default: Date.now },
            verificationStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' }
        }],

        // 9. Emergency & Compliance + System
        medicalConditions: String, // Optional but useful
        backgroundVerification: {
            status: { type: String, enum: ['Pending', 'In Progress', 'Clear', 'Failed', 'Not Required'], default: 'Pending' },
            agencyName: String,
            reportUrl: String,
            completionDate: Date
        },
        policeVerification: {
            status: { type: String, enum: ['Pending', 'Clear', 'Failed', 'Not Required'], default: 'Pending' },
            referenceNumber: String
        },

        assets: [{
            assetId: String, // Laptop / Asset ID
            type: String,    // Laptop, Phone, etc.
            name: String,
            allocatedDate: Date,
            returnDate: Date,
            status: { type: String, enum: ['Allocated', 'Returned', 'Lost', 'Damaged'] }
        }],

        jobHistory: [{
            changeDate: { type: Date, default: Date.now },
            fieldChanged: String,
            oldValue: Schema.Types.Mixed,
            newValue: Schema.Types.Mixed,
            reason: String,
            updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
        }],

        isActive: { type: Boolean, default: true },
        geoRestrictionEnabled: { type: Boolean, default: false },

        auditLogRef: { type: Schema.Types.ObjectId, ref: 'AuditLog' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },

        webauthnLoginToken: { type: String, select: false },
        webauthnLoginExpires: { type: Date, select: false },
    },
    {
        timestamps: true,
    }
);

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error: any) {
        throw new Error(error);
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
// Using standard method calls. If TS errors persist, it's likely an environment configuration issue, 
// using 'any' cast as fallback to unblock.
UserSchema.index({ organizationId: 1 });
UserSchema.index({ tenantId: 1 });
// Email index already handled by schema definition
UserSchema.index({ employeeId: 1, organizationId: 1 }, { unique: true });
UserSchema.index({ department: 1 });
UserSchema.index({ roleId: 1 });
UserSchema.index({ managerId: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
