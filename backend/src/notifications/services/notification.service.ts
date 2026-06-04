import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationStatus,
  NotificationChannel,
  NotificationEventType,
} from '../schemas/notification.schema';
import { NotificationTemplate } from '../schemas/notification-template.schema';
import { NotificationPreference } from '../schemas/notification-preference.schema';
import { NotificationEvent } from '../schemas/notification-event.schema';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { NotificationFilterDto } from '../dto/notification-filter.dto';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { InAppService } from './in-app.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(NotificationTemplate.name)
    private templateModel: Model<NotificationTemplate>,
    @InjectModel(NotificationPreference.name)
    private preferenceModel: Model<NotificationPreference>,
    @InjectModel(NotificationEvent.name)
    private eventModel: Model<NotificationEvent>,
    private emailService: EmailService,
    private smsService: SmsService,
    private inAppService: InAppService,
  ) {}

  /**
   * Create and send a notification
   */
  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    try {
      // Check user preferences
      const preferences = await this.preferenceModel.findOne({
        userId: createNotificationDto.recipientId,
      });

      if (preferences) {
        // Check if user has disabled notifications for this channel
        const channelMap = new Map(preferences.channelPreferences);
        const eventMap = new Map(preferences.eventPreferences);

        if (
          !channelMap.get(createNotificationDto.channel) ||
          !eventMap.get(createNotificationDto.eventType)
        ) {
          this.logger.log(
            `Notification skipped due to user preferences: ${createNotificationDto.recipientId}`,
          );
          // Still create the record but mark as skipped
        }
      }

      // Create notification record
      const notification = await this.notificationModel.create(
        createNotificationDto,
      );

      // Send notification via appropriate channel
      await this.sendNotification(notification);

      return notification;
    } catch (error) {
      this.logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send notification via appropriate channel
   */
  private async sendNotification(notification: Notification): Promise<void> {
    try {
      let result: any;

      switch (notification.channel) {
        case NotificationChannel.EMAIL:
          if (notification.recipientEmail) {
            result = await this.emailService.sendEmail(
              notification.recipientEmail,
              notification.subject,
              notification.message,
            );
          }
          break;

        case NotificationChannel.SMS:
          if (notification.recipientPhone) {
            result = await this.smsService.sendSMS(
              notification.recipientPhone,
              notification.message,
            );
          }
          break;

        case NotificationChannel.IN_APP:
          result = await this.inAppService.recordInAppNotification(
            notification.recipientId.toString(),
            notification.message,
            notification.metadata,
          );
          break;
      }

      if (result?.success) {
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
      } else {
        notification.status = NotificationStatus.FAILED;
        notification.failureReason = result?.error || 'Unknown error';
        notification.retryCount++;
      }

      await notification.save();
    } catch (error) {
      this.logger.error('Error sending notification:', error);
      notification.status = NotificationStatus.FAILED;
      notification.failureReason = error.message;
      notification.retryCount++;
      await notification.save();
    }
  }

  /**
   * Get all notifications for a user
   */
  async findByRecipient(
    recipientId: string,
    filter?: NotificationFilterDto,
  ): Promise<Notification[]> {
    try {
      const query: any = { recipientId };

      if (filter?.eventType) {
        query.eventType = filter.eventType;
      }

      if (filter?.channel) {
        query.channel = filter.channel;
      }

      if (filter?.status) {
        query.status = filter.status;
      }

      const limit = filter?.limit || 50;
      const skip = filter?.skip || 0;

      return this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .exec();
    } catch (error) {
      this.logger.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get single notification
   */
  async findOne(id: string): Promise<Notification> {
    try {
      const notification = await this.notificationModel.findById(id).exec();
      if (!notification) {
        throw new BadRequestException('Notification not found');
      }
      return notification;
    } catch (error) {
      this.logger.error('Error fetching notification:', error);
      throw error;
    }
  }

  /**
   * Update notification
   */
  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    try {
      const notification = await this.notificationModel.findByIdAndUpdate(
        id,
        updateNotificationDto,
        { new: true },
      );

      if (!notification) {
        throw new BadRequestException('Notification not found');
      }

      return notification;
    } catch (error) {
      this.logger.error('Error updating notification:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { isRead: true });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(recipientId: string): Promise<{ modifiedCount: number }> {
    try {
      const result = await this.notificationModel.updateMany(
        { recipientId, isRead: false },
        { isRead: true },
      );

      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      this.logger.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async remove(id: string): Promise<{ acknowledged: boolean }> {
    try {
      const result = await this.notificationModel.deleteOne({ _id: id });

      if (result.deletedCount === 0) {
        throw new BadRequestException('Notification not found');
      }

      return { acknowledged: result.acknowledged };
    } catch (error) {
      this.logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications for a user
   */
  async clearAll(recipientId: string): Promise<{ deletedCount: number }> {
    try {
      const result = await this.notificationModel.deleteMany({ recipientId });
      return { deletedCount: result.deletedCount };
    } catch (error) {
      this.logger.error('Error clearing notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(recipientId: string): Promise<number> {
    try {
      return await this.notificationModel.countDocuments({
        recipientId,
        isRead: false,
      });
    } catch (error) {
      this.logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Retry failed notifications
   */
  async retryFailed(id: string): Promise<Notification> {
    try {
      const notification = await this.findOne(id);

      if (notification.status !== NotificationStatus.FAILED) {
        throw new BadRequestException('Notification is not in failed state');
      }

      notification.status = NotificationStatus.PENDING;
      notification.retryCount++;

      await notification.save();
      await this.sendNotification(notification);

      return notification;
    } catch (error) {
      this.logger.error('Error retrying notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications statistics
   */
  async getStatistics(recipientId?: string): Promise<any> {
    try {
      const query = recipientId ? { recipientId } : {};

      const [total, sent, failed, pending, read, unread] = await Promise.all([
        this.notificationModel.countDocuments(query),
        this.notificationModel.countDocuments({
          ...query,
          status: NotificationStatus.SENT,
        }),
        this.notificationModel.countDocuments({
          ...query,
          status: NotificationStatus.FAILED,
        }),
        this.notificationModel.countDocuments({
          ...query,
          status: NotificationStatus.PENDING,
        }),
        this.notificationModel.countDocuments({ ...query, isRead: true }),
        this.notificationModel.countDocuments({ ...query, isRead: false }),
      ]);

      return {
        total,
        sent,
        failed,
        pending,
        read,
        unread,
      };
    } catch (error) {
      this.logger.error('Error getting statistics:', error);
      throw error;
    }
  }
}
