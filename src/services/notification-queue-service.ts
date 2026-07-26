import { logger } from '../lib/logger';
import { buildBackendApiUrl } from '@/lib/api/config';

type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';

export class NotificationQueueService {
    /**
     * Enqueue a notification to be sent via multiple channels
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
        logger.debug(`Enqueuing notification for user ${userId}: ${type} via Go API`);

        try {
            const response = await fetch(buildBackendApiUrl('/notifications/enqueue'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Note: Auth header should be added by the caller or a central API client
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
            // Fallback or retry logic could go here
            throw error;
        }
    }

}
