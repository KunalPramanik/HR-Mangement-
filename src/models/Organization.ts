import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for Business Unit
interface IBusinessUnit {
    name: string;
    code: string;
    head?: mongoose.Types.ObjectId;
}

// Interface for Cost Center
interface ICostCenter {
    name: string;
    code: string;
    budget: number;
}

// Interface for Legal Entity
interface ILegalEntity {
    name: string;
    taxId: string;
    country: string;
    currency: string;
    address: string;
}

// Interface for Location
interface ILocation {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    timezone: string;
    geofenceCoordinates?: {
        latitude: number;
        longitude: number;
        radius: number; // in meters
    };
}

export interface IOrganization extends Document {
    name: string;
    slug: string; // Unique URL identifier
    domain?: string; // For auto-joining based on email domain
    logo?: string;

    // Organization Structure
    businessUnits: IBusinessUnit[];
    departments: {
        name: string;
        code?: string;
        head?: mongoose.Types.ObjectId;
        parentDepartment?: string;
    }[];
    locations: ILocation[];
    costCenters: ICostCenter[];
    legalEntities: ILegalEntity[];

    // Global Settings for this Org
    defaultTimezone: string;
    defaultCurrency: string;
    dateFormat: string;

    // Contact Info
    primaryContact: {
        name: string;
        email: string;
        phone: string;
    };

    isActive: boolean;
    subscriptionPlan: 'free' | 'starter' | 'enterprise';
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    domain: { type: String, lowercase: true, trim: true },
    logo: { type: String },

    businessUnits: [{
        name: { type: String, required: true },
        code: { type: String },
        head: { type: Schema.Types.ObjectId, ref: 'User' }
    }],

    departments: [{
        name: { type: String, required: true },
        code: String,
        head: { type: Schema.Types.ObjectId, ref: 'User' },
        parentDepartment: String
    }],

    locations: [{
        name: { type: String, required: true },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zipCode: { type: String },
        timezone: { type: String, default: 'UTC' },
        geofenceCoordinates: {
            latitude: Number,
            longitude: Number,
            radius: Number
        }
    }],

    costCenters: [{
        name: { type: String, required: true },
        code: { type: String, required: true },
        budget: { type: Number, default: 0 }
    }],

    legalEntities: [{
        name: { type: String, required: true },
        taxId: { type: String },
        country: { type: String },
        currency: { type: String, default: 'USD' },
        address: { type: String }
    }],

    defaultTimezone: { type: String, default: 'UTC' },
    defaultCurrency: { type: String, default: 'USD' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },

    primaryContact: {
        name: String,
        email: String,
        phone: String
    },

    isActive: { type: Boolean, default: true },
    subscriptionPlan: { type: String, enum: ['free', 'starter', 'enterprise'], default: 'free' }
}, {
    timestamps: true
});

// Index for faster lookups
OrganizationSchema.index({ slug: 1 });
OrganizationSchema.index({ domain: 1 });

const Organization: Model<IOrganization> = mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);

export default Organization;
