import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId?: mongoose.Types.ObjectId; // For 1-on-1
    role?: string; // For role-based broadcast
    content: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        role: {
            type: String, // 'all', 'manager', 'hr', etc.
            enum: ['all', 'manager', 'hr', 'employee', 'intern'],
        },
        content: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
