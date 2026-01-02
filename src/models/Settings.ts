import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
    security: {
        passwordPolicy: {
            minLength: number;
            requireSpecialChar: boolean;
            requireNumber: boolean;
            requireCapital: boolean;
            expiryDays: number;
        };
        twoFactorAuth: {
            enabled: boolean;
            enforceForAdmins: boolean; // "enforce all admins"
            allowedMethods: string[]; // e.g. 'authenticator', 'email'
        };
        sessionTimeoutMinutes: number;
    };
    organization: {
        departments: string[]; // ["Engineering", "HR", ...]
        companyName: string;
        companyAddress: string;
        taxId: string;
    };
    holidays: {
        date: Date;
        name: string;
        type: 'Public' | 'Optional';
    }[];
    modules: {
        payroll: {
            enabled: boolean;
            provider: string; // e.g., 'Internal', 'Razorpay', 'ADP'
            autoGenerationDate: number; // e.g., 25th of month
        };
        recruitment: {
            enabled: boolean;
            portalUrl: string;
        };
        performance: {
            enabled: boolean;
            reviewFrequency: 'Quarterly' | 'Half-Yearly' | 'Annual';
            // "performance view(employee and inten self only) others filed all"
            visibility: {
                employeeCanViewPeers: boolean; // default false (self only)
            };
        };
    };
    notifications: {
        emailEnabled: boolean;
        smsEnabled: boolean;
        systemAlerts: boolean; // "light blink" enabled/disabled?
    };
    updatedBy: mongoose.Types.ObjectId;
}

const SettingsSchema = new Schema<ISettings>({
    security: {
        passwordPolicy: {
            minLength: { type: Number, default: 8 },
            requireSpecialChar: { type: Boolean, default: true },
            requireNumber: { type: Boolean, default: true },
            requireCapital: { type: Boolean, default: true },
            expiryDays: { type: Number, default: 90 }
        },
        twoFactorAuth: {
            enabled: { type: Boolean, default: true },
            enforceForAdmins: { type: Boolean, default: true },
            allowedMethods: [{ type: String, default: 'authenticator' }]
        },
        sessionTimeoutMinutes: { type: Number, default: 30 }
    },
    organization: {
        departments: [{ type: String }],
        companyName: { type: String, default: 'Mindstar Tech' },
        companyAddress: String,
        taxId: String
    },
    holidays: [{
        date: Date,
        name: String,
        type: { type: String, enum: ['Public', 'Optional'], default: 'Public' }
    }],
    modules: {
        payroll: {
            enabled: { type: Boolean, default: true },
            provider: { type: String, default: 'Internal' },
            autoGenerationDate: { type: Number, default: 28 }
        },
        recruitment: {
            enabled: { type: Boolean, default: false },
            portalUrl: String
        },
        performance: {
            enabled: { type: Boolean, default: true },
            reviewFrequency: { type: String, default: 'Quarterly' },
            visibility: {
                employeeCanViewPeers: { type: Boolean, default: false } // Enforces "Self Only" for employees by default
            }
        }
    },
    notifications: {
        emailEnabled: { type: Boolean, default: true },
        smsEnabled: { type: Boolean, default: false },
        systemAlerts: { type: Boolean, default: true }
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Singleton pattern helper
SettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            organization: { departments: ['Engineering', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations'] }
        });
    }
    return settings;
};

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
export default Settings;
