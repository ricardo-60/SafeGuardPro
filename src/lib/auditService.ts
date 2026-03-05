import { api } from './api';
import { AuditLog } from '../types';

export const auditService = {
    log: async (
        userId: string,
        userName: string,
        action: AuditLog['action'],
        entity: string,
        entityId?: string,
        before?: any,
        after?: any
    ) => {
        const log: Partial<AuditLog> = {
            user_id: userId,
            user_name: userName,
            action,
            entity,
            entity_id: entityId,
            payload_before: before,
            payload_after: after,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
        };

        try {
            // Async logging to not block UI
            api.createAuditLog(log).catch(err => console.error('Audit Log failed:', err));
        } catch (e) {
            console.error('Audit Error:', e);
        }
    }
};
