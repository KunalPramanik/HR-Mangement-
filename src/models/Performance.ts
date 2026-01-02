import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPerformance extends Document {
    userId: mongoose.Types.ObjectId;
    reviewerId: mongoose.Types.ObjectId;
    cycle: string;
    rating: 'Exceptional' | 'Exceeds Expectations' | 'Meets Expectations' | 'Needs Improvement' | 'Unsatisfactory';
    numericScore?: number; // 1-5 or 1-100
    skillRatings?: {
        skill: string;
        rating: number; // 1-5
        comment?: string;
    }[];
    status: 'Pending' | 'In Progress' | 'Completed';
    feedback: string;
    goals?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PerformanceSchema = new Schema<IPerformance>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        cycle: { type: String, required: true }, // e.g. "Q4 2025"
        rating: {
            type: String,
            enum: ['Exceptional', 'Exceeds Expectations', 'Meets Expectations', 'Needs Improvement', 'Unsatisfactory'],
            default: 'Meets Expectations'
        },
        numericScore: { type: Number, min: 0, max: 100 },
        skillRatings: [{
            skill: String,
            rating: { type: Number, min: 1, max: 5 },
            comment: String
        }],
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending'
        },
        feedback: { type: String, default: '' },
        goals: { type: String, default: '' }
    },
    { timestamps: true }
);

// Indexes
PerformanceSchema.index({ userId: 1, cycle: 1 });
PerformanceSchema.index({ status: 1 });

const Performance: Model<IPerformance> = mongoose.models.Performance || mongoose.model<IPerformance>('Performance', PerformanceSchema);

export default Performance;
