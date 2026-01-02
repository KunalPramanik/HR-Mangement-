import AuditLog from '@/models/AuditLog';
import { headers } from 'next/headers';

export async function logAudit(
    action: string,
    performerId: string,
    resourceType: string,
    targetId?: string,
    changes?: object
) {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    await AuditLog.create({
        action,
        performerId,
        targetId,
        resourceType,
        ipAddress: ip,
        deviceInfo: userAgent,
        changes,
        timestamp: new Date()
    });
}
