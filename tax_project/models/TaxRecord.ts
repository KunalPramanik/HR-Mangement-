import mongoose from 'mongoose';

const TaxRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    financialYear: { type: String, default: '2024-2025' },
    salary: {
        basic: { type: Number, default: 0 },
        hra: { type: Number, default: 0 },
        da: { type: Number, default: 0 },
        lta: { type: Number, default: 0 },
        bonus: { type: Number, default: 0 },
        specialAllowance: { type: Number, default: 0 },
        otherAllowances: { type: Number, default: 0 },
    },
    houseProperty: {
        incomeInitial: { type: Number, default: 0 },
        homeLoanInterest: { type: Number, default: 0 },
        propertyTax: { type: Number, default: 0 },
        rentReceived: { type: Number, default: 0 },
    },
    capitalGains: {
        stcg: { type: Number, default: 0 },
        ltcg: { type: Number, default: 0 },
        otherSources: { type: Number, default: 0 },
    },
    deductions: {
        section80C: { type: Number, default: 0 },
        section80D: { type: Number, default: 0 },
        section80E: { type: Number, default: 0 },
        nps: { type: Number, default: 0 },
        otherDeductions: { type: Number, default: 0 },
    },
}, { timestamps: true });

export default mongoose.models.TaxRecord || mongoose.model('TaxRecord', TaxRecordSchema);
