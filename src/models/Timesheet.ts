
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITimesheet extends Document {
    userId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    date: Date;
    project: string;
    task: string;
    description: string;
    hours: number;
    billable: boolean;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TimesheetSchema = new Schema<ITimesheet>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
        date: { type: Date, required: true },
        project: { type: String, required: true },
        task: { type: String, required: true },
        description: String,
        hours: { type: Number, required: true, min: 0, max: 24 },
        billable: { type: Boolean, default: true },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
            index: true
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

const Timesheet: Model<ITimesheet> = mongoose.models.Timesheet || mongoose.model<ITimesheet>('Timesheet', TimesheetSchema);
export default Timesheet;
