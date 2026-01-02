import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApprovalStep {
    stepName: string; // e.g., "Manager Approval", "HR Verification"
    requiredRole?: string; // 'manager', 'hr', 'admin', 'director' - if generic role
    specificApproverId?: mongoose.Types.ObjectId; // If a specific person must approve
    status: 'pending' | 'approved' | 'rejected' | 'skipped';
    approverId?: mongoose.Types.ObjectId; // Who actually approved
    comments?: string;
    actionDate?: Date;
}

export interface IApprovalRequest extends Document {
    requesterId: mongoose.Types.ObjectId;
    requestType: 'leave' | 'profile_update' | 'ticket' | 'other';
    referenceId?: mongoose.Types.ObjectId; // Link to Leave, User, Ticket, etc.
    dataPayload?: any; // For updates that aren't saved yet (e.g. profile changes)

    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    currentStep: number; // 0-indexed
    steps: IApprovalStep[];

    createdAt: Date;
    updatedAt: Date;
}

const ApprovalStepSchema = new Schema({
    stepName: { type: String, required: true },
    requiredRole: { type: String }, // Can be null if specificApproverId is set
    specificApproverId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'skipped'],
        default: 'pending'
    },
    approverId: { type: Schema.Types.ObjectId, ref: 'User' },
    comments: String,
    actionDate: Date
});

const ApprovalRequestSchema = new Schema<IApprovalRequest>(
    {
        requesterId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        requestType: {
            type: String,
            required: true,
            enum: ['leave', 'profile_update', 'ticket', 'other']
        },
        referenceId: {
            type: Schema.Types.ObjectId,
        },
        dataPayload: {
            type: Schema.Types.Mixed, // For storing JSON patches or object data
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'cancelled'],
            default: 'pending',
        },
        currentStep: {
            type: Number,
            default: 0,
        },
        steps: [ApprovalStepSchema],
    },
    {
        timestamps: true,
    }
);

// Indexes
ApprovalRequestSchema.index({ requesterId: 1 });
ApprovalRequestSchema.index({ status: 1 });
ApprovalRequestSchema.index({ 'steps.specificApproverId': 1 });
ApprovalRequestSchema.index({ 'steps.requiredRole': 1 });

const ApprovalRequest: Model<IApprovalRequest> = mongoose.models.ApprovalRequest || mongoose.model<IApprovalRequest>('ApprovalRequest', ApprovalRequestSchema);

export default ApprovalRequest;
