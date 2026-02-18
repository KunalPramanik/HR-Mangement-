import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
    organizationId: mongoose.Types.ObjectId; // Multi-tenant link

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
            enforceForAdmins: boolean;
            allowedMethods: string[];
        };
        sessionTimeoutMinutes: number; // Idle timeout
        ipRestrictions?: string[]; // Allowed IPs (CIDR)
    };

    // Organization-wide defaults/branding (that overrides Org model or complements it)
    branding: {
        primaryColor?: string;
        accentColor?: string;
        logoUrl?: string; // Overrides Org logo if present
    };

    holidays: {
        date: Date;
        name: string;
        type: 'Public' | 'Optional';
        locations?: string[]; // Applies to specific locations only
    }[];

    modules: {
        payroll: {
            enabled: boolean;
            provider: string;
            autoGenerationDate: number;
            currencySymbol: string;
        };
        recruitment: {
            enabled: boolean;
            portalUrl: string;
            careerPageEnabled: boolean;
        };
        performance: {
            enabled: boolean;
            reviewFrequency: 'Quarterly' | 'Half-Yearly' | 'Annual';
            visibility: {
                employeeCanViewPeers: boolean;
            };
        };
        attendance: {
            enabled: boolean;
            biometricIntegration: boolean;
            geofencingEnabled: boolean;
            gracePeriodMinutes: number;
        };
    };

    notifications: {
        emailEnabled: boolean;
        smsEnabled: boolean;
        slackIntegration?: {
            enabled: boolean;
            webhookUrl: string;
        };
        systemAlerts: boolean;
    };

    updatedBy: mongoose.Types.ObjectId;
}

const SettingsSchema = new Schema<ISettings>({
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },

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
        sessionTimeoutMinutes: { type: Number, default: 30 },
        ipRestrictions: [String]
    },

    branding: {
        primaryColor: String,
        accentColor: String,
        logoUrl: String
    },

    holidays: [{
        date: Date,
        name: String,
        type: { type: String, enum: ['Public', 'Optional'], default: 'Public' },
        locations: [String]
    }],

    modules: {
        payroll: {
            enabled: { type: Boolean, default: true },
            provider: { type: String, default: 'Internal' },
            autoGenerationDate: { type: Number, default: 28 },
            currencySymbol: { type: String, default: '$' }
        },
        recruitment: {
            enabled: { type: Boolean, default: false },
            portalUrl: String,
            careerPageEnabled: { type: Boolean, default: false }
        },
        performance: {
            enabled: { type: Boolean, default: true },
            reviewFrequency: { type: String, default: 'Quarterly' },
            visibility: {
                employeeCanViewPeers: { type: Boolean, default: false }
            }
        },
        attendance: {
            enabled: { type: Boolean, default: true },
            biometricIntegration: { type: Boolean, default: false },
            geofencingEnabled: { type: Boolean, default: false },
            gracePeriodMinutes: { type: Number, default: 15 }
        }
    },

    notifications: {
        emailEnabled: { type: Boolean, default: true },
        smsEnabled: { type: Boolean, default: false },
        slackIntegration: {
            enabled: { type: Boolean, default: false },
            webhookUrl: String
        },
        systemAlerts: { type: Boolean, default: true }
    },

    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Static method to get settings for an org
SettingsSchema.statics.getSettings = async function (orgId: string) {
    if (!orgId) throw new Error("Organization ID is required to fetch settings");

    let settings = await this.findOne({ organizationId: orgId });
    if (!settings) {
        settings = await this.create({
            organizationId: orgId,
            modules: {
                payroll: { enabled: true, provider: 'Internal' },
                attendance: { enabled: true }
            }
        });
    }
    return settings;
};

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
export default Settings;
