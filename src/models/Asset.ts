
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAsset extends Document {
    name: string;
    type: 'Laptop' | 'Mobile' | 'Peripheral' | 'License' | 'Furniture' | 'Other';
    serialNumber: string;
    model?: string;
    assignedTo?: mongoose.Types.ObjectId;
    assignedDate?: Date;
    status: 'Available' | 'Assigned' | 'Maintenance' | 'Retired' | 'Lost';
    purchaseDate?: Date;
    warrantyExpiry?: Date;
    cost?: number;
    tenantId: mongoose.Types.ObjectId;
    specs?: any;
    condition: 'New' | 'Good' | 'Fair' | 'Poor';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>(
    {
        name: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ['Laptop', 'Mobile', 'Peripheral', 'License', 'Furniture', 'Other'],
            required: true
        },
        serialNumber: { type: String, required: true, trim: true },
        model: { type: String, trim: true },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
        assignedDate: Date,
        status: {
            type: String,
            enum: ['Available', 'Assigned', 'Maintenance', 'Retired', 'Lost'],
            default: 'Available'
        },
        purchaseDate: Date,
        warrantyExpiry: Date,
        cost: Number,
        tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
        specs: Schema.Types.Mixed,
        condition: {
            type: String,
            enum: ['New', 'Good', 'Fair', 'Poor'],
            default: 'New'
        },
        notes: String
    },
    {
        timestamps: true
    }
);

// Unique serial number per tenant
AssetSchema.index({ tenantId: 1, serialNumber: 1 }, { unique: true });

const Asset: Model<IAsset> = mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);

export default Asset;
