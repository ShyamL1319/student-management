import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveRequest, LeaveRequestDocument } from './schemas/leave-request.schema';
import { CreateLeaveRequestDto, UpdateLeaveRequestStatusDto } from './dto/leave-request.dto';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequestDocument>,
  ) {}

  async create(userId: string, schoolId: string, role: string, dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start > end) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    return this.leaveRequestModel.create({
      school: new Types.ObjectId(schoolId),
      requesterId: new Types.ObjectId(userId),
      requesterType: role,
      startDate: start,
      endDate: end,
      type: dto.type,
      reason: dto.reason,
      status: 'PENDING',
    });
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

    item.status = dto.status;
    item.approvedBy = new Types.ObjectId(approverId);
    if (dto.remarks) {
      item.remarks = dto.remarks;
    }

    return item.save();
  }

  async remove(id: string, schoolId: string): Promise<void> {
    const result = await this.leaveRequestModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), school: new Types.ObjectId(schoolId) })
      .exec();
    if (!result) {
      throw new NotFoundException('Leave request not found');
    }
  }
}
