import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
    orgType: {
        type: String,
        enum: ['CENTRAL_GOVT', 'STATE_GOVT', 'PRIVATE'],
        required: true
    },
    configLocked: {
        type: Boolean,
        default: false
    },
    stateConfig: {
        stateName: String,
        stateCode: String,
        ptSlabs: [{
            minSalary: Number,
            maxSalary: Number,
            taxAmount: Number
        }], // Monthly professional tax slabs
        isGisApplicable: Boolean,
        isCpsApplicable: Boolean, // Contributory Pension Scheme
        isGpfApplicable: Boolean, // General Provident Fund
        treasuryFormat: String
    },
    firstPayrollGenerated: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ensure only one organization document exists effectively (singleton pattern usually handled in logic, but schema supports it)
export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
