import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayrollSettings extends Document {
    tenantId: mongoose.Types.ObjectId;
    isPayrollFrozen: boolean;
    payPeriodStart: number; // Day of month, e.g., 1
    payPeriodEnd: number; // Day of month, e.g., 30
    taxDeductionEnabled: boolean;
    updatedBy: mongoose.Types.ObjectId;
    updatedAt: Date;
}

const PayrollSettingsSchema = new Schema<IPayrollSettings>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, unique: true },
    isPayrollFrozen: { type: Boolean, default: false },
    payPeriodStart: { type: Number, default: 1 },
    payPeriodEnd: { type: Number, default: 30 },
    taxDeductionEnabled: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

const PayrollSettings: Model<IPayrollSettings> = mongoose.models.PayrollSettings || mongoose.model<IPayrollSettings>('PayrollSettings', PayrollSettingsSchema);
export default PayrollSettings;
