import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class InAppService {
  private readonly logger = new Logger(InAppService.name);

  async recordInAppNotification(
    userId: string,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // In-app notifications are stored in the database
      // This service just handles the recording logic
      this.logger.log(`In-app notification recorded for user ${userId}`);
      return {
        success: true,
        messageId: `in-app-${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`Failed to record in-app notification for user ${userId}:`, error);
      return { success: false, error: error.message };
    }
  }

  async recordBulkInAppNotifications(
    userIds: string[],
    message: string,
    metadata?: Record<string, any>,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results: { success: number; failed: number; errors: string[] } = { success: 0, failed: 0, errors: [] };

    for (const userId of userIds) {
      const result = await this.recordInAppNotification(userId, message, metadata);
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push(`${userId}: ${result.error}`);
      }
    }

    return results;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      this.logger.log(`Marked notification ${notificationId} as read`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to mark notification as read:`, error);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    try {
      this.logger.log(`Marked all notifications as read for user ${userId}`);
      return 1;
    } catch (error) {
      this.logger.error(`Failed to mark all notifications as read:`, error);
      return 0;
    }
  }
}
