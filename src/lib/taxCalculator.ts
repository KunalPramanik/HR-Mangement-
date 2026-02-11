export interface TaxResult {
    tax: number;
    cess: number;
    breakdown: {
        taxableIncome: number;
        slabs: { rate: number; amount: number }[];
    };
}

export const calculateTax = (annualIncome: number): TaxResult => {
    // Indian New Tax Regime (FY 2024-25 Estimates)
    // Slabs: 0-3L: 0%, 3-7L: 5%, 7-10L: 10%, 10-12L: 15%, 12-15L: 20%, >15L: 30%
    // Rebate 87A: Taxable income <= 7L -> No Tax.
    // Standard Deduction: 50,000

    let taxable = Math.max(0, annualIncome - 50000); // Standard Deduction
    let tax = 0;
    const slabs = [];

    // Rebate u/s 87A
    if (taxable <= 700000) {
        return {
            tax: 0,
            cess: 0,
            breakdown: { taxableIncome: taxable, slabs: [] }
        };
    }

    // Slab Calculation
    const taxSlabs = [
        { limit: 300000, rate: 0 },
        { limit: 400000, rate: 0.05 }, // 3L to 7L (Next 4L)
        { limit: 300000, rate: 0.10 }, // 7L to 10L (Next 3L)
        { limit: 200000, rate: 0.15 }, // 10L to 12L (Next 2L)
        { limit: 300000, rate: 0.20 }, // 12L to 15L (Next 3L)
        { limit: Infinity, rate: 0.30 } // > 15L
    ];

    let remainingIncome = taxable;
    let accumulatedLimit = 0;

    // Simplified calculation logic matching the previous hardcoded version but reusable
    // Note: The previous logic was slightly strictly distinct blocks. Let's stick to strict blocks for consistency.

    let tempTax = 0;

    if (taxable > 1500000) {
        tempTax += (taxable - 1500000) * 0.30;
    }
    if (taxable > 1200000) {
        const amount = Math.min(taxable, 1500000) - 1200000;
        if (amount > 0) tempTax += amount * 0.20;
    }
    if (taxable > 1000000) {
        const amount = Math.min(taxable, 1200000) - 1000000;
        if (amount > 0) tempTax += amount * 0.15;
    }
    if (taxable > 700000) {
        const amount = Math.min(taxable, 1000000) - 700000;
        if (amount > 0) tempTax += amount * 0.10;
    }
    if (taxable > 300000) {
        const amount = Math.min(taxable, 700000) - 300000;
        if (amount > 0) tempTax += amount * 0.05;
    }

    tax = tempTax;
    const cess = tax * 0.04;

    return {
        tax: tax + cess,
        cess,
        breakdown: {
            taxableIncome: taxable,
            slabs: [] // Detailed slabs can be added if needed for UI
        }
    };
};
