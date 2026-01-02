import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayslip extends Document {
    userId: mongoose.Types.ObjectId | string | any; // Allow populated
    month: string; // "YYYY-MM"
    basicSalary: number;
    hra: number;
    specialAllowance: number;
    allowances: number;
    pf: number;
    pt: number;
    deductions: number;
    netSalary: number;
    isMetro: boolean;
    status: 'Paid' | 'Pending';
    paymentMethod?: 'Bank Transfer' | 'Cheque' | 'Cash';
    transactionReference?: string;
    taxRegime?: 'Old' | 'New';
    generatedAt: Date;
    metadata?: {
        lopDays?: number;
        lopDeduction?: number;
        tax?: number;
    };
}

const PayslipSchema = new Schema<IPayslip>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        month: { type: String, required: true }, // Format: YYYY-MM

        // Earnings
        basicSalary: { type: Number, required: true },
        hra: { type: Number, default: 0 },
        specialAllowance: { type: Number, default: 0 },
        allowances: { type: Number, default: 0 }, // Other allowances

        // Deductions
        pf: { type: Number, default: 0 },
        pt: { type: Number, default: 0 },
        deductions: { type: Number, default: 0 }, // Other deductions

        // Net
        netSalary: { type: Number, required: true },

        // Meta
        isMetro: { type: Boolean, default: true },

        status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
        paymentMethod: { type: String, enum: ['Bank Transfer', 'Cheque', 'Cash'] },
        transactionReference: String,
        taxRegime: { type: String, enum: ['Old', 'New'], default: 'New' },
        generatedAt: { type: Date, default: Date.now },

        metadata: {
            lopDays: Number,
            lopDeduction: Number,
            tax: Number
        }
    },
    { timestamps: true }
);

// Prevent duplicate payslips for same user and month
PayslipSchema.index({ userId: 1, month: 1 }, { unique: true });

const Payslip: Model<IPayslip> = mongoose.models.Payslip || mongoose.model<IPayslip>('Payslip', PayslipSchema);
export default Payslip;
