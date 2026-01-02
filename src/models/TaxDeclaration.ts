import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITaxDeclaration extends Document {
    userId: mongoose.Types.ObjectId;
    financialYear: string;
    regime: 'Old' | 'New';
    investments: {
        section80C: number;
        section80D: number;
        hraRentPaid: number;
        others: number;
    };
    attachments: string[];
    status: 'Submitted' | 'Verified' | 'Rejected';
}

const TaxDeclarationSchema = new Schema<ITaxDeclaration>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        financialYear: { type: String, required: true },
        regime: { type: String, enum: ['Old', 'New'], required: true },
        investments: {
            section80C: { type: Number, default: 0 },
            section80D: { type: Number, default: 0 },
            hraRentPaid: { type: Number, default: 0 },
            others: { type: Number, default: 0 },
        },
        attachments: [{ type: String }],
        status: { type: String, enum: ['Submitted', 'Verified', 'Rejected'], default: 'Submitted' },
    },
    { timestamps: true }
);

const TaxDeclaration: Model<ITaxDeclaration> = mongoose.models.TaxDeclaration || mongoose.model<ITaxDeclaration>('TaxDeclaration', TaxDeclarationSchema);
export default TaxDeclaration;
