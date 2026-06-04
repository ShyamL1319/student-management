import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationPreference } from '../schemas/notification-preference.schema';
import {
  NotificationChannel,
  NotificationEventType,
} from '../schemas/notification.schema';
import { UpdateNotificationPreferenceDto } from '../dto/notification-preference.dto';

@Injectable()
export class NotificationPreferenceService {
  private readonly logger = new Logger(NotificationPreferenceService.name);

  constructor(
    @InjectModel(NotificationPreference.name)
    private preferenceModel: Model<NotificationPreference>,
  ) {}

  /**
   * Get or create user preferences
   */
  async getOrCreate(userId: string): Promise<NotificationPreference> {
    try {
      let preference = await this.preferenceModel.findOne({ userId });

      if (!preference) {
        preference = await this.preferenceModel.create({
          userId,
          emailNotifications: true,
          smsNotifications: true,
          inAppNotifications: true,
          doNotDisturb: false,
          isActive: true,
        });

        this.logger.log(`Preference created for user: ${userId}`);
      }

      return preference;
    } catch (error) {
      this.logger.error('Error getting or creating preference:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  async findOne(userId: string): Promise<NotificationPreference> {
    try {
      const preference = await this.preferenceModel.findOne({ userId });

      if (!preference) {
        throw new BadRequestException('User preferences not found');
      }

      return preference;
    } catch (error) {
      this.logger.error('Error fetching preference:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async update(
    userId: string,
    updatePreferenceDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    try {
      const preference = await this.preferenceModel.findOneAndUpdate(
        { userId },
        updatePreferenceDto,
        { new: true },
      );

      if (!preference) {
        throw new BadRequestException('User preferences not found');
      }

      this.logger.log(`Preference updated for user: ${userId}`);
      return preference;
    } catch (error) {
      this.logger.error('Error updating preference:', error);
      throw error;
    }
  }

  /**
   * Enable channel notifications
   */
  async enableChannel(
    userId: string,
    channel: string,
  ): Promise<NotificationPreference> {
    try {
      const preference = await this.preferenceModel.findOne({ userId });

      if (!preference) {
        throw new BadRequestException('User preferences not found');
      }

      const channelMap = new Map(preference.channelPreferences);
      channelMap.set(channel as NotificationChannel, true);
      preference.channelPreferences = channelMap;

      return await preference.save();
    } catch (error) {
      this.logger.error('Error enabling channel:', error);
      throw error;
    }
  }

  /**
   * Disable channel notifications
   */
  async disableChannel(
    userId: string,
    channel: string,
  ): Promise<NotificationPreference> {
    try {
      const preference = await this.preferenceModel.findOne({ userId });

      if (!preference) {
        throw new BadRequestException('User preferences not found');
      }

      const channelMap = new Map(preference.channelPreferences);
      channelMap.set(channel as NotificationChannel, false);
      preference.channelPreferences = channelMap;

      return await preference.save();
    } catch (error) {
      this.logger.error('Error disabling channel:', error);
      throw error;
    }
  }

  /**
   * Enable event notifications
   */
  async enableEvent(
    userId: string,
    eventType: string,
  ): Promise<NotificationPreference> {
    try {
      const preference = await this.preferenceModel.findOne({ userId });

      if (!preference) {
        throw new BadRequestException('User preferences not found');
      }

      const eventMap = new Map(preference.eventPreferences);
      eventMap.set(eventType as NotificationEventType, true);
      preference.eventPreferences = eventMap;

      return await preference.save();
    } catch (error) {
      this.logger.error('Error enabling event:', error);
      throw error;
    }
  }

  /**
   * Disable event notifications
   */
  async disableEvent(
    userId: string,
    eventType: string,
  ): Promise<NotificationPreference> {
    try {
      const preference = await this.preferenceModel.findOne({ userId });

      if (!preference) {
        throw new BadRequestException('User preferences not found');
      }

      const eventMap = new Map(preference.eventPreferences);
      eventMap.set(eventType as NotificationEventType, false);
      preference.eventPreferences = eventMap;

      return await preference.save();
    } catch (error) {
      this.logger.error('Error disabling event:', error);
      throw error;
    }
  }
}
