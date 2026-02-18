import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
    tenantId: mongoose.Types.ObjectId;
    reporterId: mongoose.Types.ObjectId;
    type: 'Daily' | 'Incident' | 'Other';
    subject: string;
    content: string;
    status: 'Submitted' | 'Reviewed' | 'Resolved';
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['Daily', 'Incident', 'Other'], default: 'Daily' },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['Submitted', 'Reviewed', 'Resolved'], default: 'Submitted' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date
}, {
    timestamps: true
});

const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
export default Report;
