import mongoose, { Schema, Document, Model } from 'mongoose';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'configure' | 'audit_view';
export type AccessScope = 'self' | 'direct_reports' | 'department' | 'business_unit' | 'organization' | 'custom';
export type FieldVisibility = 'editable' | 'read_only' | 'hidden' | 'masked' | 'encrypted';

export interface IPermission {
    resource: string; // e.g., 'employee', 'payroll', 'leave', 'attendance', 'reports'
    actions: PermissionAction[];
    scope: AccessScope;
}

export interface IFieldPermission {
    resource: string;
    field: string; // e.g. "salaryInfo.ctc"
    visibility: FieldVisibility;
}

export interface IRole extends Document {
    name: string;
    description?: string;
    organizationId: mongoose.Types.ObjectId;

    // Core Permissions
    permissions: IPermission[];

    // Field-Level Permission Engine
    fieldPermissions?: IFieldPermission[]; // New

    customScope?: {
        departmentIds?: string[];
        locationIds?: string[];
    };

    hierarchyLevel: number; // 1 (CXO) to 10 (Employee) - For escalation logic
    isSystemRole: boolean;
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const RoleSchema = new Schema<IRole>({
    name: { type: String, required: true, trim: true },
    description: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },

    permissions: [{
        resource: { type: String, required: true },
        actions: [{
            type: String,
            enum: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'configure', 'audit_view']
        }],
        scope: {
            type: String,
            enum: ['self', 'direct_reports', 'department', 'business_unit', 'organization', 'custom'],
            default: 'self'
        }
    }],

    fieldPermissions: [{
        resource: String,
        field: String,
        visibility: {
            type: String,
            enum: ['editable', 'read_only', 'hidden', 'masked', 'encrypted'],
            default: 'read_only'
        }
    }],

    customScope: {
        departmentIds: [String],
        locationIds: [String]
    },

    hierarchyLevel: { type: Number, default: 10 }, // Default to Employee level
    isSystemRole: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

RoleSchema.index({ organizationId: 1, name: 1 }, { unique: true });

const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);

export default Role;
