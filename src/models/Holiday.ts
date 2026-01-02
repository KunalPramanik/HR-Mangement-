import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHoliday extends Document {
    name: string;
    date: Date;
    type: 'public' | 'company';
    description?: string;
}

const HolidaySchema = new Schema<IHoliday>(
    {
        name: { type: String, required: true },
        date: { type: Date, required: true },
        type: { type: String, enum: ['public', 'company'], default: 'public' },
        description: String,
    },
    { timestamps: true }
);

const Holiday: Model<IHoliday> = mongoose.models.Holiday || mongoose.model<IHoliday>('Holiday', HolidaySchema);

export default Holiday;
