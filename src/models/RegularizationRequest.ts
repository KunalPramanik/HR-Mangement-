import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRegularizationRequest extends Document {
    userId: mongoose.Types.ObjectId | string;
    attendanceId: mongoose.Types.ObjectId | string;
    proposedClockIn: Date;
    proposedClockOut?: Date;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approverId?: mongoose.Types.ObjectId | string;
}

const RegularizationRequestSchema = new Schema<IRegularizationRequest>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        attendanceId: { type: Schema.Types.ObjectId, ref: 'Attendance', required: true },
        proposedClockIn: { type: Date, required: true },
        proposedClockOut: { type: Date },
        reason: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        approverId: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

const RegularizationRequest: Model<IRegularizationRequest> = mongoose.models.RegularizationRequest || mongoose.model<IRegularizationRequest>('RegularizationRequest', RegularizationRequestSchema);
export default RegularizationRequest;
