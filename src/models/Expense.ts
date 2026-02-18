
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
    userId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    amount: number;
    category: 'Travel' | 'Food' | 'Equipment' | 'Training' | 'Other';
    description: string;
    date: Date;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedBy?: mongoose.Types.ObjectId;
    rejectionReason?: string;
    receiptUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
        amount: { type: Number, required: true },
        category: {
            type: String,
            enum: ['Travel', 'Food', 'Equipment', 'Training', 'Other'],
            required: true
        },
        description: { type: String, required: true },
        date: { type: Date, required: true },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
            index: true
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        rejectionReason: String,
        receiptUrl: String
    },
    {
        timestamps: true
    }
);

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
