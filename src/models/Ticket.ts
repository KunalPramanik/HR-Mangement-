import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicket extends Document {
    ticketNumber: string;
    userId: mongoose.Types.ObjectId;
    subject: string;
    description: string;
    category: 'technical' | 'hr' | 'payroll' | 'leave' | 'benefits' | 'facilities' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    assignedTo?: mongoose.Types.ObjectId;
    attachments?: string[];
    comments?: Array<{
        userId: mongoose.Types.ObjectId;
        comment: string;
        createdAt: Date;
    }>;
    resolvedAt?: Date;
    closedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
    {
        ticketNumber: {
            type: String,
            required: true,
            unique: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['technical', 'hr', 'payroll', 'leave', 'benefits', 'facilities', 'other'],
            required: true,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['open', 'in-progress', 'resolved', 'closed'],
            default: 'open',
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        attachments: [String],
        comments: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
                comment: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        resolvedAt: Date,
        closedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes
TicketSchema.index({ userId: 1, createdAt: -1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ assignedTo: 1 });
TicketSchema.index({ ticketNumber: 1 });

const Ticket: Model<ITicket> =
    mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
