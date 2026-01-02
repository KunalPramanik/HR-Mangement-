import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJobPosting extends Document {
    title: string;
    department: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
    description: string;
    requirements: string[]; // Array of strings for bullet points
    salaryRange?: string; // e.g. "50k - 80k"
    status: 'Open' | 'Closed' | 'Draft';
    postedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const JobPostingSchema = new Schema<IJobPosting>(
    {
        title: { type: String, required: true },
        department: { type: String, required: true },
        location: { type: String, required: true },
        type: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
            default: 'Full-time'
        },
        description: { type: String, required: true },
        requirements: [{ type: String }],
        salaryRange: { type: String },
        status: {
            type: String,
            enum: ['Open', 'Closed', 'Draft'],
            default: 'Open'
        },
        postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

const JobPosting: Model<IJobPosting> = mongoose.models.JobPosting || mongoose.model<IJobPosting>('JobPosting', JobPostingSchema);
export default JobPosting;
