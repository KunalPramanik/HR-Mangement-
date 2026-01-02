import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date;
    clockIn: Date;
    clockOut?: Date;

    totalHours?: number;
    lateDuration?: number; // Minutes late
    earlyExitDuration?: number; // Minutes left early
    overtimeHours?: number;
    workLocationType?: 'Office' | 'Remote' | 'Client Site';
    geo: {
        lat?: number;
        lng?: number;
        distance?: number;
    };
    breaks: {
        activity: 'break' | 'meeting';
        startTime: Date;
        endTime?: Date;
        duration?: number; // in minutes
    }[];
    status: 'IN_PROGRESS' | 'COMPLETED';
    outcome: 'present' | 'absent' | 'late' | 'half-day' | 'regularized' | null;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        clockIn: {
            type: Date,
            required: true,
        },
        clockOut: Date,
        totalHours: Number,
        lateDuration: { type: Number, default: 0 },
        earlyExitDuration: { type: Number, default: 0 },
        overtimeHours: { type: Number, default: 0 },
        workLocationType: {
            type: String,
            enum: ['Office', 'Remote', 'Client Site'],
            default: 'Office'
        },
        geo: {
            lat: { type: Number, required: false },
            lng: { type: Number, required: false },
            distance: { type: Number, required: false }
        },
        breaks: [
            {
                activity: { type: String, enum: ['break', 'meeting'] },
                startTime: Date,
                endTime: Date,
                duration: Number
            }
        ],
        status: {
            type: String,
            enum: ['IN_PROGRESS', 'COMPLETED'],
            default: 'IN_PROGRESS',
        },
        outcome: {
            type: String,
            enum: ['present', 'absent', 'late', 'half-day', 'regularized'],
            default: null, // Explicitly null on start
        },
        notes: String,
    },
    {
        timestamps: true,
    }
);

// Strict Unique Index to prevent double clock-in per day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> =
    mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
