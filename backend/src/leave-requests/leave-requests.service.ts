import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveRequest, LeaveRequestDocument, ApprovalStep } from './schemas/leave-request.schema';
import { LeaveBalance, LeaveBalanceDocument } from './schemas/leave-balance.schema';
import { Attendance, AttendanceDocument } from '../attendances/schemas/attendance.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateLeaveRequestDto, UpdateLeaveRequestStatusDto, AllocateLeaveBalanceDto } from './dto/leave-request.dto';
import { NotificationService } from '../notifications/services/notification.service';
import { NotificationEventType, NotificationChannel } from '../notifications/schemas/notification.schema';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(LeaveBalance.name) private leaveBalanceModel: Model<LeaveBalanceDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationService: NotificationService,
  ) {}

  private calculateDuration(startDate: string | Date, endDate: string | Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  async create(userId: string, schoolId: string, role: string, dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start > end) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    if (dto.type === 'Medical' && !dto.medicalAttachmentUrl) {
      throw new BadRequestException('Medical attachment is required for Medical leaves');
    }

    const duration = this.calculateDuration(start, end);
    const year = start.getFullYear();

    // Fetch or initialize leave balance
    let balance = await this.leaveBalanceModel.findOne({
      userId: new Types.ObjectId(userId),
      leaveType: dto.type,
      year,
    }).exec();

    if (!balance) {
      // Auto initialize default balance if not set
      const defaultAllocated = dto.type === 'Sick' ? 10 : dto.type === 'Casual' ? 15 : 10;
      balance = await this.leaveBalanceModel.create({
        schoolId: new Types.ObjectId(schoolId),
        userId: new Types.ObjectId(userId),
        leaveType: dto.type,
        allocated: defaultAllocated,
        used: 0,
        pending: 0,
        year,
      });
    }

    if (balance.used + balance.pending + duration > balance.allocated) {
      throw new BadRequestException(`Insufficient leave balance. Remaining: ${balance.allocated - balance.used - balance.pending} days.`);
    }

    // Check for overlap
    const overlap = await this.leaveRequestModel.findOne({
      requesterId: new Types.ObjectId(userId),
      status: { $in: ['PENDING', 'APPROVED'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    }).exec();

    if (overlap) {
      throw new BadRequestException('You already have a pending or approved leave request for this date range');
    }

    // Setup multi-level approval steps
    const workflow: ApprovalStep[] = [];
    if (role === 'STUDENT') {
      // 2-Level Approval for Students
      workflow.push({ step: 1, status: 'PENDING', approverRole: 'TEACHER' });
      workflow.push({ step: 2, status: 'PENDING', approverRole: 'ADMIN' });
    } else {
      // 1-Level Approval for Teachers & Staff
      workflow.push({ step: 1, status: 'PENDING', approverRole: 'ADMIN' });
    }

    const leaveRequest = await this.leaveRequestModel.create({
      school: new Types.ObjectId(schoolId),
      requesterId: new Types.ObjectId(userId),
      requesterType: role,
      startDate: start,
      endDate: end,
      type: dto.type,
      reason: dto.reason,
      medicalAttachmentUrl: dto.medicalAttachmentUrl,
      status: 'PENDING',
      currentStep: 1,
      approvalWorkflow: workflow,
    });

    // Hold balance as pending
    balance.pending += duration;
    await balance.save();

    // Notify first step approvers
    await this.notifyApprovers(leaveRequest, workflow[0].approverRole);

    return leaveRequest;
  }

  async findAll(schoolId: string, query: any): Promise<{ data: LeaveRequest[]; total: number }> {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { school: new Types.ObjectId(schoolId) };
    if (query.status) {
      filter.status = query.status;
    }
    if (query.requesterType) {
      filter.requesterType = query.requesterType;
    }
    if (query.requesterId) {
      filter.requesterId = new Types.ObjectId(query.requesterId);
    }

    const [data, total] = await Promise.all([
      this.leaveRequestModel
        .find(filter)
        .populate('requesterId', 'firstName lastName email roleType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.leaveRequestModel.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string, schoolId: string): Promise<LeaveRequest> {
    const item = await this.leaveRequestModel
      .findOne({ _id: new Types.ObjectId(id), school: new Types.ObjectId(schoolId) })
      .populate('requesterId', 'firstName lastName email roleType')
      .exec();
    if (!item) {
      throw new NotFoundException('Leave request not found');
    }
    return item;
  }

  async updateStatus(id: string, schoolId: string, approverId: string, dto: UpdateLeaveRequestStatusDto): Promise<LeaveRequest> {
    const item = await this.leaveRequestModel.findOne({
      _id: new Types.ObjectId(id),
      school: new Types.ObjectId(schoolId),
    }).exec();

    if (!item) {
      throw new NotFoundException('Leave request not found');
    }

    if (item.status !== 'PENDING') {
      throw new BadRequestException('Leave request has already been processed');
    }

    const approver = await this.userModel.findById(approverId).populate('role').exec();
    if (!approver) {
      throw new NotFoundException('Approver user not found');
    }

    const approverRole = approver.roleType || (approver.role as any)?.name;

    const currentStepObj = item.approvalWorkflow.find(s => s.step === item.currentStep);
    if (!currentStepObj) {
      throw new BadRequestException('Current approval workflow step not found');
    }

    // Role-based auth verification for current step (bypassed if Admin or Super Admin)
    if (currentStepObj.approverRole !== approverRole && approverRole !== 'ADMIN' && approverRole !== 'SUPER_ADMIN') {
      throw new BadRequestException(`You do not have the required permissions (${currentStepObj.approverRole}) to approve this step`);
    }

    const duration = this.calculateDuration(item.startDate, item.endDate);
    const balance = await this.leaveBalanceModel.findOne({
      userId: item.requesterId,
      leaveType: item.type,
      year: new Date(item.startDate).getFullYear(),
    }).exec();

    if (dto.status === 'REJECTED') {
      currentStepObj.status = 'REJECTED';
      currentStepObj.approverId = new Types.ObjectId(approverId);
      currentStepObj.remarks = dto.remarks;
      currentStepObj.updatedAt = new Date();

      item.status = 'REJECTED';
      item.approvedBy = new Types.ObjectId(approverId);
      item.remarks = dto.remarks;

      // Release pending hold
      if (balance) {
        balance.pending = Math.max(0, balance.pending - duration);
        await balance.save();
      }

      await this.notificationService.create({
        recipientId: item.requesterId.toString(),
        eventType: NotificationEventType.LEAVE_REJECTED,
        channel: NotificationChannel.IN_APP,
        subject: 'Leave Request Rejected',
        message: `Your leave request from ${item.startDate.toLocaleDateString()} to ${item.endDate.toLocaleDateString()} has been rejected. Remarks: ${dto.remarks || 'None'}`,
      });
    } else {
      currentStepObj.status = 'APPROVED';
      currentStepObj.approverId = new Types.ObjectId(approverId);
      currentStepObj.remarks = dto.remarks;
      currentStepObj.updatedAt = new Date();

      const nextStep = item.approvalWorkflow.find(s => s.step === item.currentStep + 1);
      if (nextStep) {
        item.currentStep += 1;
        await this.notifyApprovers(item, nextStep.approverRole);
      } else {
        // Final approval step
        item.status = 'APPROVED';
        item.approvedBy = new Types.ObjectId(approverId);
        item.remarks = dto.remarks;

        // Transition from pending to used
        if (balance) {
          balance.pending = Math.max(0, balance.pending - duration);
          balance.used += duration;
          await balance.save();
        }

        // Attendance Backfilling
        await this.backfillAttendance(item, approverId);

        await this.notificationService.create({
          recipientId: item.requesterId.toString(),
          eventType: NotificationEventType.LEAVE_APPROVED,
          channel: NotificationChannel.IN_APP,
          subject: 'Leave Request Approved',
          message: `Your leave request from ${item.startDate.toLocaleDateString()} to ${item.endDate.toLocaleDateString()} has been approved.`,
        });
      }
    }

    return item.save();
  }

  async cancel(id: string, schoolId: string, userId: string): Promise<LeaveRequest> {
    const item = await this.leaveRequestModel.findOne({
      _id: new Types.ObjectId(id),
      school: new Types.ObjectId(schoolId),
    }).exec();

    if (!item) {
      throw new NotFoundException('Leave request not found');
    }

    if (item.requesterId.toString() !== userId) {
      throw new BadRequestException('You are not authorized to cancel this leave request');
    }

    if (item.status === 'CANCELLED') {
      throw new BadRequestException('Leave request is already cancelled');
    }

    if (item.status === 'REJECTED') {
      throw new BadRequestException('Cannot cancel a rejected leave request');
    }

    const duration = this.calculateDuration(item.startDate, item.endDate);
    const balance = await this.leaveBalanceModel.findOne({
      userId: item.requesterId,
      leaveType: item.type,
      year: new Date(item.startDate).getFullYear(),
    }).exec();

    if (item.status === 'PENDING') {
      item.status = 'CANCELLED';
      if (balance) {
        balance.pending = Math.max(0, balance.pending - duration);
        await balance.save();
      }
    } else if (item.status === 'APPROVED') {
      const now = new Date();
      const todayMidnight = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const startMidnight = new Date(Date.UTC(item.startDate.getFullYear(), item.startDate.getMonth(), item.startDate.getDate()));

      if (startMidnight <= todayMidnight) {
        throw new BadRequestException('Cannot cancel a leave request that has already started or completed');
      }

      item.status = 'CANCELLED';
      if (balance) {
        balance.used = Math.max(0, balance.used - duration);
        await balance.save();
      }

      // Remove backfilled attendance
      await this.removeAttendanceBackfill(item);
    }

    await this.notificationService.create({
      recipientId: item.requesterId.toString(),
      eventType: NotificationEventType.LEAVE_CANCELLED,
      channel: NotificationChannel.IN_APP,
      subject: 'Leave Request Cancelled',
      message: `Your leave request from ${item.startDate.toLocaleDateString()} to ${item.endDate.toLocaleDateString()} was cancelled.`,
    });

    return item.save();
  }

  async remove(id: string, schoolId: string): Promise<void> {
    const item = await this.leaveRequestModel.findOne({
      _id: new Types.ObjectId(id),
      school: new Types.ObjectId(schoolId),
    }).exec();

    if (!item) {
      throw new NotFoundException('Leave request not found');
    }

    // Release balance if deleting a pending request
    if (item.status === 'PENDING' || item.status === 'APPROVED') {
      const duration = this.calculateDuration(item.startDate, item.endDate);
      const balance = await this.leaveBalanceModel.findOne({
        userId: item.requesterId,
        leaveType: item.type,
        year: new Date(item.startDate).getFullYear(),
      }).exec();

      if (balance) {
        if (item.status === 'PENDING') {
          balance.pending = Math.max(0, balance.pending - duration);
        } else {
          balance.used = Math.max(0, balance.used - duration);
          await this.removeAttendanceBackfill(item);
        }
        await balance.save();
      }
    }

    await this.leaveRequestModel.findByIdAndDelete(id).exec();
  }

  async getBalances(userId: string, schoolId: string): Promise<LeaveBalance[]> {
    const year = new Date().getFullYear();
    const types = ['Sick', 'Casual', 'Medical'];
    const balances: LeaveBalance[] = [];

    for (const type of types) {
      let b = await this.leaveBalanceModel.findOne({
        userId: new Types.ObjectId(userId),
        leaveType: type,
        year,
      }).exec();

      if (!b) {
        const defaultAllocated = type === 'Sick' ? 10 : type === 'Casual' ? 15 : 10;
        b = await this.leaveBalanceModel.create({
          schoolId: new Types.ObjectId(schoolId),
          userId: new Types.ObjectId(userId),
          leaveType: type,
          allocated: defaultAllocated,
          used: 0,
          pending: 0,
          year,
        });
      }
      balances.push(b);
    }
    return balances;
  }

  async allocateBalance(schoolId: string, dto: AllocateLeaveBalanceDto): Promise<LeaveBalance> {
    const year = dto.year || new Date().getFullYear();
    const balance = await this.leaveBalanceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(dto.userId), leaveType: dto.leaveType, year },
      { schoolId: new Types.ObjectId(schoolId), allocated: dto.allocated },
      { upsert: true, new: true },
    ).exec();

    if (!balance) {
      throw new BadRequestException('Failed to allocate balance');
    }
    return balance;
  }

  async getAnalytics(schoolId: string): Promise<any> {
    const total = await this.leaveRequestModel.countDocuments({ school: new Types.ObjectId(schoolId) }).exec();
    const approved = await this.leaveRequestModel.countDocuments({ school: new Types.ObjectId(schoolId), status: 'APPROVED' }).exec();
    const rejected = await this.leaveRequestModel.countDocuments({ school: new Types.ObjectId(schoolId), status: 'REJECTED' }).exec();
    const pending = await this.leaveRequestModel.countDocuments({ school: new Types.ObjectId(schoolId), status: 'PENDING' }).exec();
    const cancelled = await this.leaveRequestModel.countDocuments({ school: new Types.ObjectId(schoolId), status: 'CANCELLED' }).exec();

    const typesSummary = await this.leaveRequestModel.aggregate([
      { $match: { school: new Types.ObjectId(schoolId) } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]).exec();

    const distribution = { Sick: 0, Casual: 0, Medical: 0 };
    typesSummary.forEach(t => {
      if (t._id in distribution) {
        distribution[t._id as keyof typeof distribution] = t.count;
      }
    });

    return {
      summary: { total, approved, rejected, pending, cancelled },
      distribution,
    };
  }

  private async backfillAttendance(request: LeaveRequestDocument, approverId: string): Promise<void> {
    const start = new Date(request.startDate);
    const daysCount = this.calculateDuration(request.startDate, request.endDate);
    const requester = await this.userModel.findById(request.requesterId).exec();

    for (let i = 0; i < daysCount; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);

      // Normalize date to UTC midnight
      const utcDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));

      const attendanceData: any = {
        attendeeType: request.requesterType,
        attendeeId: request.requesterId,
        date: utcDate,
        status: 'LEAVE',
        recordedBy: new Types.ObjectId(approverId),
        school: request.school,
        isActive: true,
      };

      if (request.requesterType === 'STUDENT') {
        attendanceData.student = request.requesterId;
        if (requester && (requester as any).class) attendanceData.class = (requester as any).class;
        if (requester && (requester as any).section) attendanceData.section = (requester as any).section;
      } else if (request.requesterType === 'TEACHER') {
        attendanceData.teacher = request.requesterId;
      } else if (request.requesterType === 'STAFF') {
        attendanceData.staff = request.requesterId;
      }

      await this.attendanceModel.findOneAndUpdate(
        { attendeeType: request.requesterType as any, attendeeId: request.requesterId, date: utcDate },
        attendanceData,
        { upsert: true, new: true },
      ).exec();
    }
  }

  private async removeAttendanceBackfill(request: LeaveRequestDocument): Promise<void> {
    const start = new Date(request.startDate);
    const daysCount = this.calculateDuration(request.startDate, request.endDate);

    for (let i = 0; i < daysCount; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      const utcDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));

      await this.attendanceModel.deleteOne({
        attendeeType: request.requesterType as any,
        attendeeId: request.requesterId,
        date: utcDate,
        status: 'LEAVE' as any,
      }).exec();
    }
  }

  private async notifyApprovers(request: LeaveRequestDocument, stepRole: string): Promise<void> {
    try {
      let approvers: UserDocument[] = [];
      if (stepRole === 'TEACHER' && request.requesterType === 'STUDENT') {
        const student = await this.userModel.findById(request.requesterId).exec();
        if (student && (student as any).class) {
          approvers = await this.userModel.find({
            roleType: 'TEACHER',
            classes: (student as any).class,
          }).exec();
        }
      }

      if (approvers.length === 0) {
        approvers = await this.userModel.find({
          roleType: stepRole,
        }).exec();
      }

      for (const app of approvers) {
        await this.notificationService.create({
          recipientId: app._id.toString(),
          recipientEmail: app.email,
          recipientPhone: app.phone,
          eventType: NotificationEventType.LEAVE_REQUESTED,
          channel: NotificationChannel.IN_APP,
          subject: 'New Leave Request Pending Approval',
          message: `A new leave request from ${request.startDate.toLocaleDateString()} to ${request.endDate.toLocaleDateString()} is pending your approval.`,
          relatedEntityId: request._id.toString(),
          relatedEntityType: 'LeaveRequest',
        });
      }
    } catch (error) {
      console.error('Failed to notify leave request approvers:', error);
    }
  }
}
