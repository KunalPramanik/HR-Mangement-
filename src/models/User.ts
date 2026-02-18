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

    // 3.1 Personal Information
    firstName: string;
    middleName?: string;
    lastName: string;
    gender?: 'Male' | 'Female' | 'Other';
    dateOfBirth?: Date;
    maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    bloodGroup?: string;
    nationality?: string;
    aadhaar?: string; // Encrypted
    passportDetails?: {
        number: string;
        expiryDate: Date;
    };
    profilePicture?: string;
    coverPhoto?: string;

    // 3.2 Contact Information
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

    // 3.3 Job Details
    position: string;
    department: string;
    businessUnit?: string;
    managerId?: mongoose.Types.ObjectId;
    hrManagerId?: mongoose.Types.ObjectId;

    employeeType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern' | 'Freelance';
    employmentStatus: 'active' | 'resigned' | 'terminated' | 'probation' | 'notice_period' | 'internship_completed' | 'suspended';
    suspensionReason?: string;

    dateOfJoining: Date;
    probationPeriod?: number; // in months
    confirmationDate?: Date;

    // Location & Shift
    workLocationId?: mongoose.Types.ObjectId;
    workLocation?: {
        latitude: number;
        longitude: number;
        radiusMeters: number;
    };
    shiftType?: string;
    grade?: string;
    costCenter?: string;

    // 3.4 Compensation Details (ENCRYPTED FIELDS - String)
    salaryInfo?: {
        ctc: string;
        basic: string;
        hra: string;
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
        esicNum?: string;
        pfEnabled: boolean;
    };

    // 3.5 Document Management
    documents?: {
        name: string;
        type: string;
        url: string;
        expiryDate?: Date;
        uploadedAt?: Date;
    }[];

    // Capabilities & Skills
    skills?: string[];
    certifications?: {
        name: string;
        issuer: string;
        date: Date;
        expiryDate?: Date;
        url?: string;
    }[];

    // Job History / Audit
    jobHistory?: {
        changeDate: Date;
        fieldChanged: string;
        oldValue: string | number;
        newValue: string | number;
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

        employeeId: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },

        role: {
            type: String,
            enum: ['employee', 'manager', 'hr', 'intern', 'admin', 'cho', 'cxo', 'director', 'vp', 'cfo'],
            default: 'employee',
        },
        roleId: { type: Schema.Types.ObjectId, ref: 'Role' },

        firstName: { type: String, required: true, trim: true },
        middleName: { type: String, trim: true },
        lastName: { type: String, required: true, trim: true },

        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        dateOfBirth: Date,
        maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },
        bloodGroup: String,
        nationality: String,
        aadhaar: String,
        passportDetails: {
            number: String,
            expiryDate: Date
        },
        profilePicture: String,
        coverPhoto: String,

        phoneNumber: String,
        personalEmail: String,
        officialEmail: String,
        currentAddress: String,
        permanentAddress: String,
        emergencyContact: {
            name: String,
            relationship: String,
            phoneNumber: String,
        },

        position: { type: String, required: true },
        department: { type: String, required: true },
        businessUnit: String,
        managerId: { type: Schema.Types.ObjectId, ref: 'User' },
        hrManagerId: { type: Schema.Types.ObjectId, ref: 'User' },

        employeeType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Freelance'], default: 'Full-time' },
        employmentStatus: {
            type: String,
            enum: ['active', 'resigned', 'terminated', 'probation', 'notice_period', 'internship_completed', 'suspended'],
            default: 'active'
        },
        suspensionReason: String,

        dateOfJoining: { type: Date, required: true },
        probationPeriod: Number,
        confirmationDate: Date,

        workLocationId: { type: Schema.Types.ObjectId, ref: 'Organization.locations' },
        workLocation: {
            latitude: Number,
            longitude: Number,
            radiusMeters: Number,
        },
        shiftType: String,
        grade: String,
        costCenter: String,

        salaryInfo: {
            ctc: { type: String },
            basic: { type: String },
            hra: { type: String },
            da: { type: String },
            pf: { type: String },
            esi: { type: String },
            pt: { type: String },
            specialAllowance: { type: String },
            bonus: { type: String },
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
            pan: { type: String },
            uan: { type: String },
            esicNum: { type: String },
            pfEnabled: { type: Boolean, default: true }
        },

        documents: [{
            name: String,
            type: String,
            url: String,
            expiryDate: Date,
            uploadedAt: { type: Date, default: Date.now }
        }],

        skills: [String],
        certifications: [{
            name: String,
            issuer: String,
            date: Date,
            expiryDate: Date,
            url: String
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

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
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
