import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationEvent } from '../schemas/notification-event.schema';
import {
  NotificationEventType,
  NotificationChannel,
} from '../schemas/notification.schema';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationEventService {
  private readonly logger = new Logger(NotificationEventService.name);

  constructor(
    @InjectModel(NotificationEvent.name)
    private eventModel: Model<NotificationEvent>,
    private notificationService: NotificationService,
  ) {}

  /**
   * Trigger attendance alert
   */
  async triggerAttendanceAlert(
    studentId: string,
    studentEmail: string,
    studentPhone: string,
    attendanceData: any,
  ): Promise<NotificationEvent> {
    try {
      const eventData = {
        studentId,
        absenceCount: attendanceData.absenceCount,
        attendancePercentage: attendanceData.attendancePercentage,
        criticalThreshold: 75,
      };

      const event = await this.eventModel.create({
        eventType: NotificationEventType.ATTENDANCE_ALERT,
        triggeredBy: studentId,
        relatedEntityId: studentId,
        relatedEntityType: 'Student',
        eventData,
      });

      // Send notifications via all channels
      await this.notificationService.create({
        recipientId: studentId,
        recipientEmail: studentEmail,
        recipientPhone: studentPhone,
        eventType: NotificationEventType.ATTENDANCE_ALERT,
        channel: NotificationChannel.EMAIL,
        subject: 'Attendance Alert',
        message: `Your attendance is below the required threshold. Current: ${attendanceData.attendancePercentage}%`,
      });

      this.logger.log(`Attendance alert triggered for student: ${studentId}`);
      return event;
    } catch (error) {
      this.logger.error('Error triggering attendance alert:', error);
      throw error;
    }
  }

  /**
   * Trigger fee alert
   */
  async triggerFeeAlert(
    studentId: string,
    studentEmail: string,
    studentPhone: string,
    feeData: any,
  ): Promise<NotificationEvent> {
    try {
      const eventData = {
        studentId,
        pendingAmount: feeData.pendingAmount,
        dueDate: feeData.dueDate,
        lastNotificationDate: new Date(),
      };

      const event = await this.eventModel.create({
        eventType: NotificationEventType.FEE_ALERT,
        triggeredBy: studentId,
        relatedEntityId: studentId,
        relatedEntityType: 'Student',
        eventData,
      });

      // Send notifications via all channels
      await this.notificationService.create({
        recipientId: studentId,
        recipientEmail: studentEmail,
        recipientPhone: studentPhone,
        eventType: NotificationEventType.FEE_ALERT,
        channel: NotificationChannel.EMAIL,
        subject: 'Fee Payment Due',
        message: `You have pending fees of Rs. ${feeData.pendingAmount}. Due date: ${feeData.dueDate}`,
      });

      this.logger.log(`Fee alert triggered for student: ${studentId}`);
      return event;
    } catch (error) {
      this.logger.error('Error triggering fee alert:', error);
      throw error;
    }
  }

  /**
   * Trigger result alert
   */
  async triggerResultAlert(
    studentId: string,
    studentEmail: string,
    studentPhone: string,
    resultData: any,
  ): Promise<NotificationEvent> {
    try {
      const eventData = {
        studentId,
        examName: resultData.examName,
        totalMarks: resultData.totalMarks,
        obtainedMarks: resultData.obtainedMarks,
        percentage: resultData.percentage,
      };

      const event = await this.eventModel.create({
        eventType: NotificationEventType.RESULT_ALERT,
        triggeredBy: studentId,
        relatedEntityId: studentId,
        relatedEntityType: 'Student',
        eventData,
      });

      // Send notifications via all channels
      await this.notificationService.create({
        recipientId: studentId,
        recipientEmail: studentEmail,
        recipientPhone: studentPhone,
        eventType: NotificationEventType.RESULT_ALERT,
        channel: NotificationChannel.EMAIL,
        subject: 'Exam Results Published',
        message: `Your ${resultData.examName} results are published. You scored ${resultData.obtainedMarks}/${resultData.totalMarks} (${resultData.percentage}%)`,
      });

      this.logger.log(`Result alert triggered for student: ${studentId}`);
      return event;
    } catch (error) {
      this.logger.error('Error triggering result alert:', error);
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  async findOne(id: string): Promise<NotificationEvent> {
    try {
      const event = await this.eventModel.findById(id).exec();

      if (!event) {
        throw new BadRequestException('Event not found');
      }

      return event;
    } catch (error) {
      this.logger.error('Error fetching event:', error);
      throw error;
    }
  }

  /**
   * Get all events
   */
  async findAll(filters?: {
    eventType?: string;
    relatedEntityType?: string;
  }): Promise<NotificationEvent[]> {
    try {
      const query: any = { isActive: true };

      if (filters?.eventType) {
        query.eventType = filters.eventType;
      }

      if (filters?.relatedEntityType) {
        query.relatedEntityType = filters.relatedEntityType;
      }

      return this.eventModel.find(query).sort({ createdAt: -1 }).exec();
    } catch (error) {
      this.logger.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Get event statistics
   */
  async getStatistics(): Promise<any> {
    try {
      const [total, success, failure] = await Promise.all([
        this.eventModel.countDocuments(),
        this.eventModel.countDocuments({
          $expr: { $gt: ['$successCount', 0] },
        }),
        this.eventModel.countDocuments({
          $expr: { $gt: ['$failureCount', 0] },
        }),
      ]);

      return {
        total,
        success,
        failure,
      };
    } catch (error) {
      this.logger.error('Error getting statistics:', error);
      throw error;
    }
  }
}
