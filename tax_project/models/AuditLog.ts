import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    entityType: {
        type: String, // 'EMPLOYEE', 'PAYROLL', 'ORG', etc.
        required: true
    },
    entityId: {
        type: String, // ID of the modified document
        required: true
    },
    oldValue: {
        type: mongoose.Schema.Types.Mixed // JSON snapshot of state before change
    },
    newValue: {
        type: mongoose.Schema.Types.Mixed // JSON snapshot of state after change
    },
    performedBy: {
        type: String,
        default: 'SYSTEM_OPERATOR' // Since we are simulating a single authorized operator
    },
    timestamp: {
        type: Date,
        default: Date.now,
        immutable: true
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
