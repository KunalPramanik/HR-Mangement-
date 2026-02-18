import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
    tenantId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    date: Date; // Normalized to YYYY-MM-DD

    checkIn?: Date;
    checkInLocation?: {
        lat: number;
        lng: number;
        address?: string;
        isValid: boolean; // Geofence check
    };

    checkOut?: Date;
    checkOutLocation?: {
        lat: number;
        lng: number;
        address?: string;
        isValid: boolean;
    };

    breaks: {
        activity: 'break' | 'meeting';
        startTime: Date;
        endTime?: Date;
        durationMinutes: number;
    }[];

    totalWorkHours?: number; // Calculated field
    overtimeHours?: number; // Hours worked beyond 9 hours
    isLate?: boolean; // Clocked in after 9:30 AM
    status: 'Present' | 'Absent' | 'Half-Day' | 'Late' | 'On-Leave' | 'Holiday' | 'Weak-Off';

    // Manual adjustments
    regularizationRequest?: {
        newCheckIn: Date;
        newCheckOut: Date;
        reason: string;
        status: 'Pending' | 'Approved' | 'Rejected';
        approvedBy?: mongoose.Types.ObjectId;
    };

    notes?: string;

    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },

    checkIn: Date,
    checkInLocation: {
        lat: Number,
        lng: Number,
        address: String,
        isValid: Boolean
    },

    checkOut: Date,
    checkOutLocation: {
        lat: Number,
        lng: Number,
        address: String,
        isValid: Boolean
    },

    breaks: [{
        activity: { type: String, enum: ['break', 'meeting'] },
        startTime: Date,
        endTime: Date,
        durationMinutes: Number
    }],

    totalWorkHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    isLate: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Half-Day', 'Late', 'On-Leave', 'Holiday', 'Weak-Off'],
        default: 'Absent',
        index: true
    },

    regularizationRequest: {
        newCheckIn: Date,
        newCheckOut: Date,
        reason: String,
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },

    notes: String
}, {
    timestamps: true
});

// Compound index: Unique check-in per employee per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
export default Attendance;
