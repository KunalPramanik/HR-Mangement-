import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPerformanceReview extends Document {
    tenantId: mongoose.Types.ObjectId;
    cycleName: string; // "Q1 2025"
    employeeId: mongoose.Types.ObjectId;
    managerId: mongoose.Types.ObjectId;

    // Core Data
    status: 'Self-Assessment' | 'Manager-Review' | 'Director-Approval' | 'Discussed' | 'Closed';

    // Self Assessment
    selfRating?: number; // 1-5
    achievements?: string;
    areasOfImprovement?: string;
    goalsForNextPeriod?: string;

    // Manager Feedback
    managerRating?: number;
    managerComments?: string;
    competencyScores?: {
        competency: string; // "Technical Skill", "Communication"
        score: number;
        comment: string;
    }[];

    // Finalization
    finalScore?: number;
    promotionRecommended?: boolean;
    salaryHikeRecommended?: number; // %

    // Sign-off
    employeeAcknowledged?: boolean;
    completedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const PerformanceReviewSchema = new Schema<IPerformanceReview>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    cycleName: { type: String, required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    status: {
        type: String,
        enum: ['Self-Assessment', 'Manager-Review', 'Director-Approval', 'Discussed', 'Closed'],
        default: 'Self-Assessment',
        index: true
    },

    selfRating: { type: Number, min: 1, max: 5 },
    achievements: String,
    areasOfImprovement: String,
    goalsForNextPeriod: String,

    managerRating: { type: Number, min: 1, max: 5 },
    managerComments: String,
    competencyScores: [{
        competency: String,
        score: Number,
        comment: String
    }],

    finalScore: Number,
    promotionRecommended: Boolean,
    salaryHikeRecommended: Number,

    employeeAcknowledged: { type: Boolean, default: false },
    completedAt: Date
}, {
    timestamps: true
});

PerformanceReviewSchema.index({ cycleName: 1, employeeId: 1 }, { unique: true }); // Only one review per cycle per employee

const PerformanceReview: Model<IPerformanceReview> = mongoose.models.PerformanceReview || mongoose.model<IPerformanceReview>('PerformanceReview', PerformanceReviewSchema);
export default PerformanceReview;
