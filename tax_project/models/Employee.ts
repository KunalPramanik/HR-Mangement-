import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true,
        immutable: true // auto-generated, never editable
    },
    fullName: {
        type: String,
        required: true
    },
    pan: {
        type: String,
        required: true,
        unique: true,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format']
    },
    dateOfJoining: {
        type: Date,
        required: true
    },
    employmentType: {
        type: String,
        enum: ['PERMANENT', 'CONTRACT', 'INTERN'],
        required: true
    },
    payStructure: {
        type: {
            type: String,
            enum: ['PAY_LEVEL', 'CTC_SLAB'], // Govt vs Private
            required: true
        },
        value: String // e.g., "7" for Level 7, or "1200000" for CTC
    },
    bankDetails: {
        accountNumber: { type: String, required: true },
        ifscCode: { type: String, required: true },
        bankName: String
    },
    officeDetails: {
        department: String,
        designation: String,
        ddoCode: String // For Govt
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'SUSPENDED', 'TERMINATED'],
        default: 'ACTIVE'
    }
}, { timestamps: true });

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
