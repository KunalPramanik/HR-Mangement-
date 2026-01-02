import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReimbursement extends Document {
    userId: mongoose.Types.ObjectId;
    category: 'Travel' | 'Internet' | 'Medical' | 'Learning';
    amount: number;
    dateStr: string;
    description: string;
    attachmentUrl: string;
    status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
    approvedBy?: mongoose.Types.ObjectId;
}

const ReimbursementSchema = new Schema<IReimbursement>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        category: { type: String, enum: ['Travel', 'Internet', 'Medical', 'Learning'], required: true },
        amount: { type: Number, required: true },
        dateStr: { type: String, required: true },
        description: { type: String, required: true },
        attachmentUrl: { type: String },
        status: { type: String, enum: ['Pending', 'Approved', 'Paid', 'Rejected'], default: 'Pending' },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

const Reimbursement: Model<IReimbursement> = mongoose.models.Reimbursement || mongoose.model<IReimbursement>('Reimbursement', ReimbursementSchema);
export default Reimbursement;
