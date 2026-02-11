import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    employeeId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'employee' | 'manager' | 'hr' | 'admin' | 'cho' | 'cxo' | 'director' | 'vp' | 'intern' | 'cfo';
    department: string;
    position: string;
    managerId?: mongoose.Types.ObjectId;
    hrManagerId?: mongoose.Types.ObjectId;
    phoneNumber?: string;
    dateOfBirth?: Date;
    hireDate: Date;
    profilePicture?: string;
    coverPhoto?: string;
    address?: string;
    emergencyContact?: {
        name?: string;
        relationship?: string;
        phoneNumber?: string;
    };
    leaveBalance: {
        annual: number;
        sick: number;
        personal: number;
    };
    documents?: {
        name: string;
        url: string;
        type: string;
    }[];
    isActive: boolean;
    salary: number;
    createdAt: Date;
    updatedAt: Date;
    employmentStatus: 'active' | 'resigned' | 'terminated' | 'probation' | 'notice_period' | 'internship_completed';

    skills?: string[];
    certifications?: {
        name: string;
        issuer: string;
        date: Date;
        expiryDate?: Date;
        url?: string;
    }[];
    jobHistory?: {
        changeDate: Date;
        fieldChanged: string; // e.g. "Role", "Department", "Salary"
        oldValue: string | number;
        newValue: string | number;
        reason?: string;
        updatedBy?: mongoose.Types.ObjectId;
    }[];
    workLocation?: {
        latitude: number;
        longitude: number;
        radiusMeters: number;
    };
    geoRestrictionEnabled?: boolean;
    salaryInfo?: {
        ctc: number;
        basic: number;
        hra: number;
        da: number;
        pf: number;
        pt: number;
        specialAllowance?: number;
        isMetro?: boolean;
        deductions: number;
    };
    bankInfo?: {
        accountName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
        branchName: string;
    };
    statutoryInfo?: {
        pan: string;
        uan: string;
        esicNum: string;
        pfEnabled: boolean;
    };
    webauthnLoginToken?: string;
    webauthnLoginExpires?: Date;
}

const UserSchema = new Schema<IUser>(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ['employee', 'manager', 'hr', 'intern', 'admin', 'cho', 'cxo', 'director', 'vp', 'cfo'],
            default: 'employee',
        },
        employmentStatus: {
            type: String,
            enum: ['active', 'resigned', 'terminated', 'probation', 'notice_period', 'internship_completed'],
            default: 'active',

        },
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
        department: {
            type: String,
            required: true,
        },
        position: {
            type: String,
            required: true,
        },
        managerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        hrManagerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        phoneNumber: String,
        dateOfBirth: Date,
        hireDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        profilePicture: String,
        coverPhoto: String,
        address: String,
        emergencyContact: {
            name: String,
            relationship: String,
            phoneNumber: String,
        },
        leaveBalance: {
            annual: {
                type: Number,
                default: 22,
            },
            sick: {
                type: Number,
                default: 10,
            },
            personal: {
                type: Number,
                default: 5,
            },
        },
        documents: [{
            name: String,
            url: String,
            type: String
        }],
        isActive: {
            type: Boolean,
            default: true,
        },
        workLocation: {
            type: {
                latitude: Number,
                longitude: Number,
                radiusMeters: Number, // Allowed radius (e.g., 100m)
            },
            default: null
        },
        geoRestrictionEnabled: {
            type: Boolean,
            default: false
        },
        salaryInfo: {
            ctc: { type: Number, default: 0 },
            basic: { type: Number, default: 0 },
            hra: { type: Number, default: 0 },
            da: { type: Number, default: 0 },
            pf: { type: Number, default: 0 },
            pt: { type: Number, default: 0 },
            deductions: { type: Number, default: 0 }
        },
        bankInfo: {
            accountName: String,
            accountNumber: String,
            ifscCode: String,
            bankName: String,
            branchName: String
        },
        statutoryInfo: {
            pan: { type: String, default: '' },
            uan: { type: String, default: '' },
            esicNum: { type: String, default: '' },
            pfEnabled: { type: Boolean, default: true }
        },
        webauthnLoginToken: { type: String, select: false },
        webauthnLoginExpires: { type: Date, select: false },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
UserSchema.index({ department: 1 });
UserSchema.index({ managerId: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
