import mongoose from 'mongoose';

const PayrollCycleSchema = new mongoose.Schema({
    month: {
        type: Number, // 1-12
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['DRAFT', 'CALCULATED', 'FINALIZED', 'PAID', 'LOCKED'],
        default: 'DRAFT',
        required: true
    },
    records: [{
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        earnings: {
            basic: Number,
            da: Number,
            hra: Number,
            ta: Number,
            medical: Number,
            special: Number,
            bonus: Number,
            arrears: Number,
            totalGross: Number
        },
        deductions: {
            pf: Number, // Provident Fund (GPF/EPF)
            nps: Number,
            pt: Number, // Professional Tax
            it: Number, // Income Tax
            gis: Number, // Group Insurance Scheme
            loanRecovery: Number,
            totalDeductions: Number
        },
        netPay: Number,
        payslipGenerated: { type: Boolean, default: false }
    }],
    isLocked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Compound index to ensure unique payroll per month/year
PayrollCycleSchema.index({ month: 1, year: 1 }, { unique: true });

export default mongoose.models.PayrollCycle || mongoose.model('PayrollCycle', PayrollCycleSchema);
