import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaveBalanceAdjustment extends Document {
    requesterId: mongoose.Types.ObjectId;
    targetUserId: mongoose.Types.ObjectId;
    leaveType: 'annual' | 'sick' | 'personal';
    adjustmentDays: number; // can be positive or negative
    reason: string;
    flow: 'admin_cxo_cho_director';
    status: 'PENDING_CXO' | 'PENDING_CHO' | 'PENDING_DIRECTOR' | 'APPROVED' | 'REJECTED';
    currentStep: number; // 1=CXO, 2=CHO, 3=DIRECTOR
    auditLog: {
        role: string;
        action: 'CREATED' | 'APPROVED' | 'REJECTED';
        approverId: mongoose.Types.ObjectId;
        timestamp: Date;
        comments?: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const LeaveBalanceAdjustmentSchema = new Schema<ILeaveBalanceAdjustment>(
    {
        requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        targetUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        leaveType: {
            type: String,
            enum: ['annual', 'sick', 'personal'],
            required: true
        },
        adjustmentDays: { type: Number, required: true }, // e.g. +5 or -2
        reason: { type: String, required: true },
        flow: { type: String, default: 'admin_cxo_cho_director' },
        status: {
            type: String,
            enum: ['PENDING_CXO', 'PENDING_CHO', 'PENDING_DIRECTOR', 'APPROVED', 'REJECTED'],
            default: 'PENDING_CXO'
        },
        currentStep: { type: Number, default: 1 },
        auditLog: [{
            role: String,
            action: String,
            approverId: { type: Schema.Types.ObjectId, ref: 'User' },
            timestamp: { type: Date, default: Date.now },
            comments: String
        }]
    },
    { timestamps: true }
);

const LeaveBalanceAdjustment: Model<ILeaveBalanceAdjustment> =
    mongoose.models.LeaveBalanceAdjustment || mongoose.model<ILeaveBalanceAdjustment>('LeaveBalanceAdjustment', LeaveBalanceAdjustmentSchema);

export default LeaveBalanceAdjustment;
