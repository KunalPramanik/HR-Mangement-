import AuditLog, { IAuditLog } from '@/models/AuditLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

interface AuditParams {
    actionType: IAuditLog['actionType'];
    module: IAuditLog['module'];
    performedBy: string;
    targetUser?: string;
    targetDocumentId?: string;
    description: string;
    tenantId: string;
    diff?: { field: string; oldValue: any; newValue: any }[];
    req?: Request;
}

export async function logAudit(params: AuditParams) {
    try {
        const entry = new AuditLog({
            actionType: params.actionType,
            module: params.module,
            performedBy: params.performedBy,
            targetUser: params.targetUser,
            targetDocumentId: params.targetDocumentId,
            description: params.description,
            tenantId: params.tenantId,
            diff: params.diff,
            ipAddress: params.req ? (params.req.headers.get('x-forwarded-for') || '127.0.0.1') : undefined,
            userAgent: params.req ? params.req.headers.get('user-agent') : undefined,
        });
        await entry.save();
    } catch (error) {
        console.error("Audit Logging Failed:", error);
        // We don't want to crash the main request if logging fails, but in high security apps we might.
    }
}
