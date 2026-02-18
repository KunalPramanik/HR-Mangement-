import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask extends Document {
    tenantId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    assignedTo: mongoose.Types.ObjectId; // User ID
    assignedBy: mongoose.Types.ObjectId; // User ID (Manager/Self)
    dueDate: Date;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    type: 'Project' | 'Administrative' | 'Training' | 'Personal' | 'Other';

    // Workflow
    approvedBy?: mongoose.Types.ObjectId;
    completedAt?: Date;

    // Attachments (Can be URLs)
    attachments?: string[];

    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    title: { type: String, required: true },
    description: String,
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
        default: 'Pending',
        index: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    type: { type: String, default: 'Other' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    completedAt: Date,
    attachments: [String]
}, {
    timestamps: true
});

// Compound index for dashboard queries: "My pending high priority tasks"
TaskSchema.index({ assignedTo: 1, status: 1, priority: -1 });

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
export default Task;
