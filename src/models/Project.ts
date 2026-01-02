import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
    name: string;
    description: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
    startDate: Date;
    endDate: Date;
    managerId: mongoose.Types.ObjectId;
    teamMembers: mongoose.Types.ObjectId[];
    budget: number;
    tasks: {
        title: string;
        status: 'Pending' | 'In Progress' | 'Done';
        assignedTo?: mongoose.Types.ObjectId;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String },
        status: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
            default: 'Not Started',
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        teamMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        budget: { type: Number, default: 0 },
        tasks: [
            {
                title: String,
                status: { type: String, enum: ['Pending', 'In Progress', 'Done'], default: 'Pending' },
                assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
            },
        ],
    },
    { timestamps: true }
);

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
