import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
    actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW' | 'EXPORT' | 'APPROVE' | 'REJECT';
    module: 'User' | 'Task' | 'Leave' | 'Review' | 'Attendance' | 'Payroll' | 'Auth' | 'Settings';
    performedBy: mongoose.Types.ObjectId; // User who performed the action
    targetUser?: mongoose.Types.ObjectId; // User who was affected
    targetDocumentId?: mongoose.Types.ObjectId; // ID of the document (Leave ID, Task ID, etc)
    diff: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    ipAddress?: string;
    userAgent?: string;
    description: string;
    tenantId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
    actionType: { type: String, required: true },
    module: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetUser: { type: Schema.Types.ObjectId, ref: 'User' },
    targetDocumentId: { type: Schema.Types.ObjectId },
    diff: [{
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed
    }],
    ipAddress: String,
    userAgent: String,
    description: String,
    tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
}, {
    timestamps: { createdAt: true, updatedAt: false } // Audit logs are immutable
});

AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ targetUser: 1 });
AuditLogSchema.index({ module: 1 });

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
