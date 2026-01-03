import mongoose, { Schema, Document } from 'mongoose';

export interface IPasskey extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    credentialID: string;
    credentialPublicKey: Buffer;
    counter: number;
    transports: string[];
    deviceName?: string;
    createdAt: Date;
    lastUsedAt?: Date;
}

const PasskeySchema = new Schema<IPasskey>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    credentialID: {
        type: String,
        required: true,
        unique: true,
    },
    credentialPublicKey: {
        type: Buffer,
        required: true,
    },
    counter: {
        type: Number,
        required: true,
        default: 0,
    },
    transports: {
        type: [String],
        default: [],
    },
    deviceName: {
        type: String,
        default: 'Unknown Device',
    },
    lastUsedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

export default mongoose.models.Passkey || mongoose.model<IPasskey>('Passkey', PasskeySchema);
