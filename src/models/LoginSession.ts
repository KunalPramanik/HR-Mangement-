import mongoose, { Schema, Document, Model } from 'mongoose';

interface ILoginSession extends Document {
    sessionId: string;
    pin: string;
    status: 'pending' | 'authenticated' | 'expired';
    userId?: mongoose.Types.ObjectId;
    loginToken?: string;
    createdAt: Date;
    expiresAt: Date;
}

const LoginSessionSchema = new Schema<ILoginSession>({
    sessionId: { type: String, required: true, unique: true },
    pin: { type: String, required: true },
    status: { type: String, enum: ['pending', 'authenticated', 'expired'], default: 'pending' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    loginToken: { type: String },
    expiresAt: { type: Date, required: true, expires: 0 } // TTL index
}, {
    timestamps: true
});

const LoginSession: Model<ILoginSession> = mongoose.models.LoginSession || mongoose.model<ILoginSession>('LoginSession', LoginSessionSchema);

export default LoginSession;
