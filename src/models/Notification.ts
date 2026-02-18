import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
    read: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
        link: { type: String },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Index for efficient fetching by user
NotificationSchema.index({ userId: 1, read: 1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
