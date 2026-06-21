import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ActivityLog,
  ActivityLogDocument,
  ActivityType,
} from './schemas/activity-log.schema';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @InjectModel(ActivityLog.name)
    private activityModel: Model<ActivityLogDocument>,
  ) {}

  async logActivity(data: {
    type: ActivityType;
    description: string;
    icon: string;
    student?: string | Types.ObjectId;
    school?: string | Types.ObjectId;
  }) {
    try {
      await this.activityModel.create({
        type: data.type,
        description: data.description,
        icon: data.icon,
        student: data.student ? new Types.ObjectId(data.student.toString()) : undefined,
        school: data.school ? new Types.ObjectId(data.school.toString()) : undefined,
        occurredAt: new Date(),
      });
    } catch (error: any) {
      this.logger.error(`Failed to log activity: ${error.message}`, error.stack);
    }
  }

  async getRecentActivities(
    studentId: string | Types.ObjectId,
    limit: number = 10,
  ) {
    const logs = await this.activityModel
      .find({
        $or: [
          { student: new Types.ObjectId(studentId.toString()) },
          { student: { $exists: false } },
        ],
      })
      .sort({ occurredAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    if (logs.length === 0) {
      return [
        {
          description: 'No recent activity yet.',
          icon: '⌛',
          time: 'Just now',
        },
      ];
    }

    return logs.map((log) => ({
      description: log.description,
      icon: log.icon,
      time: this.formatTimeAgo(log.occurredAt),
    }));
  }

  private formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} months ago`;
  }
}
