import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // Default for dev only
const IV_LENGTH = 16;

export function encrypt(text: string): string {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error("Encryption error:", error);
        return text;
    }
}

export function decrypt(text: string): string {
    if (!text) return text;
    try {
        const textParts = text.split(':');
        if (textParts.length < 2) return text;
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption error:", error);
        return text;
    }
}

// Fields to encrypt/decrypt
const SENSITIVE_FIELDS = [
    'aadhaar',
    'salaryInfo.ctc', 'salaryInfo.basic', 'salaryInfo.hra', 'salaryInfo.da', 'salaryInfo.specialAllowance',
    'salaryInfo.bonus', 'salaryInfo.pf', 'salaryInfo.esi', 'salaryInfo.pt', 'salaryInfo.deductions', 'salaryInfo.netSalary',
    'bankInfo.bankName', 'bankInfo.accountName', 'bankInfo.accountNumber', 'bankInfo.ifscCode', 'bankInfo.branchName',
    'statutoryInfo.pan', 'statutoryInfo.uan', 'statutoryInfo.esicNum'
];

export function encryptUser(user: any) {
    const encryptedUser = { ...user };

    // Aadhaar
    if (user.aadhaar) encryptedUser.aadhaar = encrypt(String(user.aadhaar));

    // Salary Info
    if (user.salaryInfo) {
        encryptedUser.salaryInfo = { ...user.salaryInfo };
        for (const key in user.salaryInfo) {
            if (user.salaryInfo[key] !== undefined && user.salaryInfo[key] !== null) {
                encryptedUser.salaryInfo[key] = encrypt(String(user.salaryInfo[key]));
            }
        }
    }

    // Bank Info
    if (user.bankInfo) {
        encryptedUser.bankInfo = { ...user.bankInfo };
        for (const key in user.bankInfo) {
            if (user.bankInfo[key]) encryptedUser.bankInfo[key] = encrypt(String(user.bankInfo[key]));
        }
    }

    // Statutory Info
    if (user.statutoryInfo) {
        encryptedUser.statutoryInfo = { ...user.statutoryInfo };
        for (const key in user.statutoryInfo) {
            if (key !== 'pfEnabled' && user.statutoryInfo[key]) {
                encryptedUser.statutoryInfo[key] = encrypt(String(user.statutoryInfo[key]));
            }
        }
    }

    return encryptedUser;
}

export function decryptUser(user: any) {
    if (!user) return user;
    const decryptedUser = { ...user };
    if (user.toObject) Object.assign(decryptedUser, user.toObject()); // Handle Mongoose doc

    // Aadhaar
    if (decryptedUser.aadhaar) decryptedUser.aadhaar = decrypt(decryptedUser.aadhaar);

    // Salary Info
    if (decryptedUser.salaryInfo) {
        decryptedUser.salaryInfo = { ...decryptedUser.salaryInfo };
        for (const key in decryptedUser.salaryInfo) {
            if (decryptedUser.salaryInfo[key]) {
                const decryptedVal = decrypt(decryptedUser.salaryInfo[key]);
                // Try to parse back to number if it looks like one? Or keep as string.
                // The frontend expects numbers usually for calculations but inputs handle strings.
                // Let's keep as string representing number.
                decryptedUser.salaryInfo[key] = decryptedVal;
            }
        }
    }

    // Bank Info
    if (decryptedUser.bankInfo) {
        decryptedUser.bankInfo = { ...decryptedUser.bankInfo };
        for (const key in decryptedUser.bankInfo) {
            if (decryptedUser.bankInfo[key]) decryptedUser.bankInfo[key] = decrypt(decryptedUser.bankInfo[key]);
        }
    }

    // Statutory Info
    if (decryptedUser.statutoryInfo) {
        decryptedUser.statutoryInfo = { ...decryptedUser.statutoryInfo };
        for (const key in decryptedUser.statutoryInfo) {
            if (key !== 'pfEnabled' && decryptedUser.statutoryInfo[key]) {
                decryptedUser.statutoryInfo[key] = decrypt(decryptedUser.statutoryInfo[key]);
            }
        }
    }

    return decryptedUser;
}
