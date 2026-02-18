
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
    title: string;
    department: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance';
    description: string;
    status: 'Open' | 'Closed' | 'Draft';
    postedBy: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    applicants: mongoose.Types.ObjectId[]; // Refs to Candidates
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
    {
        title: { type: String, required: true, trim: true },
        department: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
            default: 'Full-time',
            required: true
        },
        description: { type: String, required: true },
        status: {
            type: String,
            enum: ['Open', 'Closed', 'Draft'],
            default: 'Open',
            index: true
        },
        postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
        applicants: [{ type: Schema.Types.ObjectId, ref: 'Candidate' }]
    },
    {
        timestamps: true
    }
);

// Compound index for efficient filtering per tenant
JobSchema.index({ tenantId: 1, status: 1 });
JobSchema.index({ tenantId: 1, department: 1 });

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
