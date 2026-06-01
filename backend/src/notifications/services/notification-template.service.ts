import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationTemplate } from '../schemas/notification-template.schema';
import { NotificationChannel, NotificationEventType } from '../schemas/notification.schema';
import { CreateNotificationTemplateDto, UpdateNotificationTemplateDto } from '../dto/notification-template.dto';

@Injectable()
export class NotificationTemplateService {
  private readonly logger = new Logger(NotificationTemplateService.name);

  constructor(
    @InjectModel(NotificationTemplate.name) private templateModel: Model<NotificationTemplate>,
  ) {}

  /**
   * Create notification template
   */
  async create(createTemplateDto: CreateNotificationTemplateDto): Promise<NotificationTemplate> {
    try {
      const template = await this.templateModel.create(createTemplateDto);
      this.logger.log(`Template created: ${template._id}`);
      return template;
    } catch (error) {
      this.logger.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Get all templates
   */
  async findAll(filters?: { eventType?: string; channel?: string }): Promise<NotificationTemplate[]> {
    try {
      const query: any = { isActive: true };

      if (filters?.eventType) {
        query.eventType = filters.eventType;
      }

      if (filters?.channel) {
        query.channel = filters.channel;
      }

      return this.templateModel.find(query).exec();
    } catch (error) {
      this.logger.error('Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Get single template
   */
  async findOne(id: string): Promise<NotificationTemplate> {
    try {
      const template = await this.templateModel.findById(id).exec();

      if (!template) {
        throw new BadRequestException('Template not found');
      }

      return template;
    } catch (error) {
      this.logger.error('Error fetching template:', error);
      throw error;
    }
  }

  /**
   * Update template
   */
  async update(id: string, updateTemplateDto: UpdateNotificationTemplateDto): Promise<NotificationTemplate> {
    try {
      const template = await this.templateModel.findByIdAndUpdate(
        id,
        updateTemplateDto,
        { new: true },
      );

      if (!template) {
        throw new BadRequestException('Template not found');
      }

      this.logger.log(`Template updated: ${id}`);
      return template;
    } catch (error) {
      this.logger.error('Error updating template:', error);
      throw error;
    }
  }

  /**
   * Delete template
   */
  async remove(id: string): Promise<{ acknowledged: boolean }> {
    try {
      const result = await this.templateModel.deleteOne({ _id: id });

      if (result.deletedCount === 0) {
        throw new BadRequestException('Template not found');
      }

      this.logger.log(`Template deleted: ${id}`);
      return { acknowledged: result.acknowledged };
    } catch (error) {
      this.logger.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Get template by event type and channel
   */
  async findByEventAndChannel(eventType: string, channel: string): Promise<NotificationTemplate> {
    try {
      const template = await this.templateModel.findOne({
        eventType: eventType as NotificationEventType,
        channel: channel as NotificationChannel,
        isActive: true,
      });

      if (!template) {
        throw new BadRequestException('Template not found for this event and channel');
      }

      return template;
    } catch (error) {
      this.logger.error('Error fetching template:', error);
      throw error;
    }
  }
}
