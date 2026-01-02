import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferral extends Document {
    jobId: mongoose.Types.ObjectId;
    referrerId: mongoose.Types.ObjectId;
    candidateName: string;
    candidateEmail: string;
    candidatePhone: string;
    resumeUrl?: string; // Link to uploaded resume
    relationship: string; // e.g. "Former Colleague", "Friend"
    status: 'Pending' | 'Reviewed' | 'Interviewing' | 'Hired' | 'Rejected';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
    {
        jobId: { type: Schema.Types.ObjectId, ref: 'JobPosting', required: true },
        referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        candidateName: { type: String, required: true },
        candidateEmail: { type: String, required: true },
        candidatePhone: { type: String, required: true },
        resumeUrl: { type: String },
        relationship: { type: String, required: true },
        status: {
            type: String,
            enum: ['Pending', 'Reviewed', 'Interviewing', 'Hired', 'Rejected'],
            default: 'Pending'
        },
        notes: { type: String }
    },
    { timestamps: true }
);

const Referral: Model<IReferral> = mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);
export default Referral;
