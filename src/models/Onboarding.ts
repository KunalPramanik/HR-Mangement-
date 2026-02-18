
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOnboarding extends Document {
    userId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    status: 'Not Started' | 'In Progress' | 'Submitted' | 'Verified' | 'Completed' | 'Rejected';
    currentStep: number;
    personalDetails?: {
        firstName: string;
        lastName: string;
        phone: string;
        dob: Date;
        address: string;
    };
    documents?: {
        name: string;
        type: string;
        url: string;
        status: 'Pending' | 'Verified' | 'Rejected';
    }[];
    assets?: {
        laptop: boolean;
        monitor: boolean;
        keyboard: boolean;
        mouse: boolean;
        headset: boolean;
        requestedAt: Date;
    }[];
    bankInfo?: {
        accountName: string;
        accountNumber: string;
        bankName: string;
        ifscCode: string;
    };
    policyAccepted: boolean;
    policyAcceptedAt?: Date;
    verifiedBy?: mongoose.Types.ObjectId;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const OnboardingSchema = new Schema<IOnboarding>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
        status: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Submitted', 'Verified', 'Completed', 'Rejected'],
            default: 'Not Started'
        },
        currentStep: { type: Number, default: 1 },
        personalDetails: {
            firstName: String,
            lastName: String,
            phone: String,
            dob: Date,
            address: String
        },
        documents: [{
            name: String,
            type: String,
            url: String,
            status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' }
        }],
        assets: [{
            laptop: Boolean,
            monitor: Boolean,
            keyboard: Boolean,
            mouse: Boolean,
            headset: Boolean,
            requestedAt: { type: Date, default: Date.now }
        }],
        bankInfo: {
            accountName: String,
            accountNumber: String, // Should be encrypted in real app, but for now plain
            bankName: String,
            ifscCode: String
        },
        policyAccepted: { type: Boolean, default: false },
        policyAcceptedAt: Date,
        verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        completedAt: Date
    },
    {
        timestamps: true
    }
);

const Onboarding: Model<IOnboarding> = mongoose.models.Onboarding || mongoose.model<IOnboarding>('Onboarding', OnboardingSchema);

export default Onboarding;
