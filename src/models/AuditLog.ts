import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
    action: string;
    performerId: mongoose.Types.ObjectId;
    targetId?: string; // Changed to String to allow generic IDs or status flags like "NEW"
    resourceType: string;
    ipAddress: string;
    deviceInfo: string;
    changes?: object;
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        action: { type: String, required: true },
        performerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        targetId: { type: String }, // Generic ID
        resourceType: { type: String, required: true },
        ipAddress: { type: String, required: true },
        deviceInfo: { type: String, required: true },
        changes: { type: Object },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true } // adds createdAt, updatedAt
);

// Index for fast searching by performer or resource
AuditLogSchema.index({ performerId: 1, timestamp: -1 });
AuditLogSchema.index({ resourceType: 1, timestamp: -1 });

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
