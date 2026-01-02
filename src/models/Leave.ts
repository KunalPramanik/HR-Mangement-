import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeave extends Document {
    userId: mongoose.Types.ObjectId;
    leaveType: 'annual' | 'sick' | 'personal' | 'unpaid' | 'maternity' | 'paternity';
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approverId?: mongoose.Types.ObjectId;
    approverComments?: string;
    approvedAt?: Date;
    attachments?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        leaveType: {
            type: String,
            enum: ['annual', 'sick', 'personal', 'unpaid', 'maternity', 'paternity'],
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        totalDays: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'cancelled'],
            default: 'pending',
        },
        approverId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        approverComments: String,
        approvedAt: Date,
        attachments: [String],
    },
    {
        timestamps: true,
    }
);

// Indexes
LeaveSchema.index({ userId: 1, createdAt: -1 });
LeaveSchema.index({ status: 1 });
LeaveSchema.index({ approverId: 1 });

const Leave: Model<ILeave> = mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);

export default Leave;
