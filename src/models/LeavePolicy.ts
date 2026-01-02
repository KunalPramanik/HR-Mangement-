import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeavePolicy extends Document {
    leaveType: string;
    accrualFrequency: 'Monthly' | 'Quarterly' | 'Yearly';
    accrualAmount: number;
    maxCarryForward: number;
    encashable: boolean;
    sandwichRule: boolean;
}

const LeavePolicySchema = new Schema<ILeavePolicy>(
    {
        leaveType: { type: String, required: true, unique: true },
        accrualFrequency: { type: String, enum: ['Monthly', 'Quarterly', 'Yearly'], required: true },
        accrualAmount: { type: Number, required: true },
        maxCarryForward: { type: Number, default: 0 },
        encashable: { type: Boolean, default: false },
        sandwichRule: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const LeavePolicy: Model<ILeavePolicy> = mongoose.models.LeavePolicy || mongoose.model<ILeavePolicy>('LeavePolicy', LeavePolicySchema);
export default LeavePolicy;
