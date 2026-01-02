import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
    title: string;
    content: string;
    authorId: mongoose.Types.ObjectId;
    category: 'general' | 'event' | 'policy' | 'urgent' | 'celebration';
    priority: 'low' | 'medium' | 'high';
    targetAudience: 'all' | 'employees' | 'managers' | 'hr' | 'department';
    targetDepartments?: string[];
    attachments?: string[];
    isPublished: boolean;
    publishedAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        category: {
            type: String,
            enum: ['general', 'event', 'policy', 'urgent', 'celebration'],
            default: 'general',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        targetAudience: {
            type: String,
            enum: ['all', 'employees', 'managers', 'hr', 'department'],
            default: 'all',
        },
        targetDepartments: [String],
        attachments: [String],
        isPublished: {
            type: Boolean,
            default: false,
        },
        publishedAt: Date,
        expiresAt: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes
AnnouncementSchema.index({ isPublished: 1, publishedAt: -1 });
AnnouncementSchema.index({ category: 1 });

const Announcement: Model<IAnnouncement> =
    mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

export default Announcement;
