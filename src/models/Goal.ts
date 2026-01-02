import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGoal extends Document {
    reviewCycleId: string;
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    category: 'KRA' | 'Development';
    weightage: number;
    targetValue: number;
    currentValue: number;
    selfRating?: number;
    managerRating?: number;
}

const GoalSchema = new Schema<IGoal>(
    {
        reviewCycleId: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        description: { type: String },
        category: { type: String, enum: ['KRA', 'Development'], required: true },
        weightage: { type: Number, required: true },
        targetValue: { type: Number, default: 100 },
        currentValue: { type: Number, default: 0 },
        selfRating: { type: Number },
        managerRating: { type: Number },
    },
    { timestamps: true }
);

const Goal: Model<IGoal> = mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);
export default Goal;
