/**
 * @deprecated Notification queue has been migrated to the Go backend.
 * All notification processing is handled server-side.
 * This file is kept as a reference for the API contract only.
 * 
 * To enqueue a notification, call the Go API directly:
 *   POST /api/notifications/enqueue
 * 
 * See: src/lib/api/routes.ts for the endpoint definition.
 */
import { logger } from '../lib/logger';
import { buildBackendApiUrl } from '@/lib/api/config';

type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';

export class NotificationQueueService {
    /**
     * Enqueue a notification to be sent via multiple channels
     * @deprecated Use the Go API directly via POST /api/notifications/enqueue
     */
    static async enqueueNotification(
        userId: string,
        type: string,
        title: string,
        message: string,
        options?: {
            channels?: NotificationChannel[];
            metadata?: Record<string, unknown>;
            priority?: 'high' | 'normal' | 'low';
        }
    ) {
        logger.debug(`[Deprecated] Enqueuing notification for user ${userId}: ${type} via Go API`);

        try {
            const response = await fetch(buildBackendApiUrl('/notifications/enqueue'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    type,
                    title,
                    message,
                    channels: options?.channels || ['in-app'],
                    metadata: options?.metadata,
                    priority: options?.priority || 'normal',
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to enqueue notification: ${response.statusText}`);
            }

            logger.info(`[NotificationQueueService] Notification enqueued successfully via Go API`);
        } catch (error) {
            logger.error(`[NotificationQueueService] Error enqueuing notification:`, error);
            throw error;
        }
    }
}