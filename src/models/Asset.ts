import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAsset extends Document {
    name: string;
    type: 'Laptop' | 'Mobile' | 'Peripheral' | 'License' | 'Furniture' | 'Other';
    serialNumber: string;
    status: 'Available' | 'Assigned' | 'Maintenance' | 'Retired';
    assignedTo?: mongoose.Types.ObjectId;
    assignedDate?: Date;
    condition: 'New' | 'Good' | 'Fair' | 'Poor';
    purchaseDate?: Date;
    value?: number;
    notes?: string;
}

const AssetSchema = new Schema<IAsset>(
    {
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['Laptop', 'Mobile', 'Peripheral', 'License', 'Furniture', 'Other'],
            required: true
        },
        serialNumber: { type: String, required: true, unique: true },
        status: {
            type: String,
            enum: ['Available', 'Assigned', 'Maintenance', 'Retired'],
            default: 'Available'
        },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
        assignedDate: { type: Date },
        condition: {
            type: String,
            enum: ['New', 'Good', 'Fair', 'Poor'],
            default: 'New'
        },
        purchaseDate: { type: Date },
        value: { type: Number },
        notes: { type: String }
    },
    { timestamps: true }
);

const Asset: Model<IAsset> = mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);
export default Asset;
