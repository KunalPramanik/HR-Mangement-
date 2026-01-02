import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShift extends Document {
    name: string;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    gracePeriodMins: number;
    breakDurationMins: number;
    isNightShift: boolean;
}

const ShiftSchema = new Schema<IShift>(
    {
        name: { type: String, required: true, unique: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        gracePeriodMins: { type: Number, default: 15 },
        breakDurationMins: { type: Number, default: 60 },
        isNightShift: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Shift: Model<IShift> = mongoose.models.Shift || mongoose.model<IShift>('Shift', ShiftSchema);
export default Shift;
