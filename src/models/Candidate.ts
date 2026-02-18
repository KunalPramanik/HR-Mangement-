
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICandidate extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobId: mongoose.Types.ObjectId;
    stage: 'Sourced' | 'Screening' | 'Interviewing' | 'Offer' | 'Hired' | 'Rejected';
    resumeUrl?: string;
    notes?: string;
    tenantId: mongoose.Types.ObjectId;
    appliedAt: Date;
    updatedAt: Date;
}

const CandidateSchema = new Schema<ICandidate>(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true },
        jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
        stage: {
            type: String,
            enum: ['Sourced', 'Screening', 'Interviewing', 'Offer', 'Hired', 'Rejected'],
            default: 'Sourced',
            index: true
        },
        resumeUrl: String,
        notes: String,
        tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
        appliedAt: { type: Date, default: Date.now }
    },
    {
        timestamps: true
    }
);

// Compound index for efficient filtering
CandidateSchema.index({ tenantId: 1, jobId: 1, stage: 1 });
CandidateSchema.index({ email: 1, jobId: 1 }, { unique: true }); // Prevent duplicate applications for same job

const Candidate: Model<ICandidate> = mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);

export default Candidate;
