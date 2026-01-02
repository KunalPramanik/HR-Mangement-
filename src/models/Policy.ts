import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPolicy extends Document {
    title: string;
    content: string; // HTML or Markdown
    category: string; // e.g., 'General', 'Leave', 'Conduct'
    effectiveDate: Date;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PolicySchema = new Schema<IPolicy>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        category: { type: String, required: true },
        effectiveDate: { type: Date, default: Date.now },
        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const Policy: Model<IPolicy> = mongoose.models.Policy || mongoose.model<IPolicy>('Policy', PolicySchema);
export default Policy;
