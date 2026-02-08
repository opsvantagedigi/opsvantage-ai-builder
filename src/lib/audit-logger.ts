import { prisma } from './prisma';
import { JsonValue } from '@prisma/client/runtime/library';

export type AuditEntity = 'PAGE' | 'PROJECT' | 'WORKSPACE' | 'MEMBER' | 'DOMAIN' | 'AI_TASK';

interface LogOptions {
    workspaceId: string;
    actorId: string;
    action: string;
    entityType: AuditEntity;
    entityId: string;
    metadata?: JsonValue;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Records an activity in the audit log.
 */
export async function logActivity(options: LogOptions) {
    try {
        return await prisma.auditLog.create({
            data: {
                workspaceId: options.workspaceId,
                actorId: options.actorId,
                action: options.action,
                entityType: options.entityType,
                entityId: options.entityId,
                metadata: options.metadata || {},
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
            },
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // We don't throw here to avoid breaking the main flow if logging fails
        return null;
    }
}
