
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITraining extends Document {
    title: string;
    description: string;
    provider: string; // Internal or External
    instructor: string;
    startDate: Date;
    endDate: Date;
    durationHours: number;
    type: 'Technical' | 'Soft Skills' | 'Compliance' | 'Onboarding' | 'Other';
    attendees: mongoose.Types.ObjectId[]; // Array of User IDs
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
    location: string; // URL or Physical
    tenantId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TrainingSchema = new Schema<ITraining>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        provider: { type: String, default: 'Internal' },
        instructor: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        durationHours: { type: Number, required: true },
        type: {
            type: String,
            enum: ['Technical', 'Soft Skills', 'Compliance', 'Onboarding', 'Other'],
            required: true
        },
        attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        status: {
            type: String,
            enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
            default: 'Scheduled',
            index: true
        },
        location: String,
        tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }
    },
    {
        timestamps: true
    }
);

const Training: Model<ITraining> = mongoose.models.Training || mongoose.model<ITraining>('Training', TrainingSchema);

export default Training;
