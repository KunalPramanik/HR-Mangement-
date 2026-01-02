import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKudos extends Document {
    fromUserId: mongoose.Types.ObjectId;
    toUserId: mongoose.Types.ObjectId;
    message: string;
    badge: 'Star' | 'Team Player' | 'Innovator' | 'Hard Worker' | 'Leader' | 'Problem Solver';
    createdAt: Date;
}

const KudosSchema = new Schema<IKudos>(
    {
        fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        badge: {
            type: String,
            enum: ['Star', 'Team Player', 'Innovator', 'Hard Worker', 'Leader', 'Problem Solver'],
            required: true
        },
    },
    { timestamps: true }
);

const Kudos: Model<IKudos> = mongoose.models.Kudos || mongoose.model<IKudos>('Kudos', KudosSchema);
export default Kudos;
