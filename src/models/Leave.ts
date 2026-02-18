import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeave extends Document {
    tenantId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    leaveType: 'Annual' | 'Sick' | 'Unpaid' | 'Maternity' | 'Paternity' | 'Compensatory' | 'Study';
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Partially Approved';

    // Approval Workflow
    approvals?: {
        level: number; // 1 = Manager, 2 = Director
        approverId: mongoose.Types.ObjectId;
        status: 'Pending' | 'Approved' | 'Rejected';
        comments?: string;
        actionDate?: Date;
    }[];

    currentApproverId?: mongoose.Types.ObjectId; // Who needs to action this now.
    finalStatus?: 'Approved' | 'Rejected' | 'Pending'; // Ultimate result

    // Attachments
    medicalCertificate?: string;

    cancelReason?: string;

    createdAt: Date;
    updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    leaveType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    reason: String,

    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Partially Approved'],
        default: 'Pending',
        index: true
    },

    approvals: [{
        level: Number,
        approverId: { type: Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] },
        comments: String,
        actionDate: Date
    }],

    currentApproverId: { type: Schema.Types.ObjectId, ref: 'User' },
    finalStatus: { type: String, default: 'Pending' },
    medicalCertificate: String,
    cancelReason: String,
}, {
    timestamps: true
});

LeaveSchema.index({ currentApproverId: 1, status: 1 }); // For "My Approvals" dashboard

const Leave: Model<ILeave> = mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);
export default Leave;
