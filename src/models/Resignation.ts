import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResignation extends Document {
    userId: mongoose.Types.ObjectId;
    reason: string;
    intendedLastDay: Date;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    managerComments?: string;
    hrComments?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ResignationSchema = new Schema<IResignation>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        intendedLastDay: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed'],
            default: 'pending',
        },
        managerComments: String,
        hrComments: String,
    },
    {
        timestamps: true,
    }
);

const Resignation: Model<IResignation> = mongoose.models.Resignation || mongoose.model<IResignation>('Resignation', ResignationSchema);

export default Resignation;
