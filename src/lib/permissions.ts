import { IUser } from "@/models/User";
import { IRole, IFieldPermission } from "@/models/Role";

/**
 * Checks if a user has access to a specific field on a target resource.
 * Returns the visibility level: 'editable' | 'read_only' | 'hidden' | 'masked' | 'encrypted'
 */
export function getFieldVisibility(viewer: IUser, targetResource: string, fieldName: string, role?: IRole): string {
    // 1. Super Admin Bypass
    if (viewer.role === 'admin' && viewer.email.includes('admin@mindstar.com')) {
        return 'editable';
    }

    // 2. Self Access (Usually read-only for sensitive, editable for contact)
    const isSelf = viewer._id.equals(targetResource); // Assuming resource passed is ID, or context handles this check
    // If resource string is just 'User', we need context if it's THEIR record.
    // For this utility, we assume 'viewer' role definitions handle "Self" scope logic if we had resource ownership context.

    // 3. Check Role Field Permissions
    if (!role || !role.fieldPermissions) return 'read_only'; // Default safe fallback

    const permission = role.fieldPermissions.find(p => p.resource === 'User' && p.field === fieldName);

    if (permission) {
        return permission.visibility;
    }

    // 4. Fallback defaults based on sensitivity
    if (['salaryInfo', 'bankInfo', 'statutoryInfo'].includes(fieldName)) {
        return 'hidden';
    }

    return 'read_only';
}

/**
 * Masks data based on visibility
 */
export function processField(data: any, fieldName: string, visibility: string): any {
    if (visibility === 'hidden') return undefined;
    if (visibility === 'masked') {
        // Simple masking logic
        const val = data[fieldName];
        if (typeof val === 'string' && val.length > 4) {
            return '****' + val.slice(-4);
        }
        if (typeof val === 'number') {
            return '****';
        }
        return '****';
    }
    if (visibility === 'encrypted') {
        return '[ENCRYPTED]'; // Frontend should request decryption via separate secure channel
    }
    return data[fieldName];
}
