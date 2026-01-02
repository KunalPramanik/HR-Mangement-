import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssetRequest extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'Laptop' | 'Mobile' | 'Peripheral';
    specification: string;
    justification: string;
    status: 'Pending' | 'Allocated' | 'Rejected';
    allocatedAssetId?: string;
}

const AssetRequestSchema = new Schema<IAssetRequest>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['Laptop', 'Mobile', 'Peripheral'], required: true },
        specification: { type: String, required: true },
        justification: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Allocated', 'Rejected'], default: 'Pending' },
        allocatedAssetId: { type: String },
    },
    { timestamps: true }
);

const AssetRequest: Model<IAssetRequest> = mongoose.models.AssetRequest || mongoose.model<IAssetRequest>('AssetRequest', AssetRequestSchema);
export default AssetRequest;
