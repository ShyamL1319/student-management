/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Attendance,
  AttendanceDocument,
  AttendanceStatus,
  AttendanceType,
} from './schemas/attendance.schema';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceReportQueryDto } from './dto/attendance-report-query.dto';

@Injectable()
export class AttendancesService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
  ) {}

  private normalizeDate(dateString: string | Date): Date {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid attendance date');
    }
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
  }

  private buildAttendeeRefs(
    attendeeType: AttendanceType,
    attendeeId: string,
  ): Partial<Attendance> {
    const id = Types.ObjectId.isValid(attendeeId)
      ? new Types.ObjectId(attendeeId)
      : attendeeId;

    return {
      student: attendeeType === AttendanceType.STUDENT ? id : undefined,
      teacher: attendeeType === AttendanceType.TEACHER ? id : undefined,
      staff: attendeeType === AttendanceType.STAFF ? id : undefined,
    } as Partial<Attendance>;
  }

  async create(
    createAttendanceDto: CreateAttendanceDto,
  ): Promise<AttendanceDocument> {
    const attendanceDate = this.normalizeDate(createAttendanceDto.date);
    const attendeeId = new Types.ObjectId(createAttendanceDto.attendeeId);

    const existing = await this.attendanceModel.exists({
      attendeeType: createAttendanceDto.attendeeType,
      attendeeId,
      date: {
        $gte: attendanceDate,
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Attendance record already exists for this attendee on the selected date',
      );
    }

    const attendeeRefs = this.buildAttendeeRefs(
      createAttendanceDto.attendeeType,
      createAttendanceDto.attendeeId,
    );

    return this.attendanceModel.create({
      ...createAttendanceDto,
      attendeeId,
      date: attendanceDate,
      ...attendeeRefs,
    });
  }

  async findAll(query: any): Promise<{ data: AttendanceDocument[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      attendeeType,
      attendeeId,
      status,
      school,
      class: classId,
      section,
      academicYear,
      date,
      isActive,
    } = query;

    const filter: any = {};
    if (attendeeType) filter.attendeeType = attendeeType;
    if (attendeeId && Types.ObjectId.isValid(attendeeId)) filter.attendeeId = attendeeId;
    if (status) filter.status = status;
    if (school && Types.ObjectId.isValid(school)) filter.school = school;
    if (classId && Types.ObjectId.isValid(classId)) filter.class = classId;
    if (section && Types.ObjectId.isValid(section)) filter.section = section;
    if (academicYear && Types.ObjectId.isValid(academicYear)) filter.academicYear = academicYear;
    if (typeof isActive !== 'undefined') {
      filter.isActive = isActive === 'true' || isActive === true;
    }
    if (date) {
      const attendanceDate = this.normalizeDate(date);
      filter.date = {
        $gte: attendanceDate,
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.attendanceModel
        .find(filter)
        .populate('student', 'firstName lastName admissionNumber')
        .populate('teacher', 'firstName lastName')
        .populate('staff', 'firstName lastName')
        .populate('school', 'name')
        .populate('academicYear', 'name startDate endDate')
        .populate('class', 'name')
        .populate('section', 'name')
        .sort({ date: -1, attendeeType: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.attendanceModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<AttendanceDocument> {
    const attendance = await this.attendanceModel
      .findById(id)
      .populate('student', 'firstName lastName admissionNumber')
      .populate('teacher', 'firstName lastName')
      .populate('staff', 'firstName lastName')
      .populate('school', 'name')
      .populate('academicYear', 'name startDate endDate')
      .populate('class', 'name')
      .populate('section', 'name')
      .exec();

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }
    return attendance;
  }

  async update(
    id: string,
    updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<AttendanceDocument> {
    const attendance = await this.attendanceModel.findById(id).exec();
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    const attendeeType =
      updateAttendanceDto.attendeeType || attendance.attendeeType;
    const attendeeId =
      updateAttendanceDto.attendeeId || attendance.attendeeId.toString();

    const attendeeRefs = this.buildAttendeeRefs(attendeeType, attendeeId);
    const updateData: any = {
      ...updateAttendanceDto,
      attendeeType,
      attendeeId: new Types.ObjectId(attendeeId),
      ...attendeeRefs,
    };

    if (updateAttendanceDto.date) {
      updateData.date = this.normalizeDate(updateAttendanceDto.date);
    }

    const updated = await this.attendanceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Attendance record not found after update');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.attendanceModel.findByIdAndDelete(id).exec();
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }
  }

  async getDailyReport(
    query: AttendanceReportQueryDto,
  ): Promise<Record<string, any>> {
    const date = query.date
      ? this.normalizeDate(query.date)
      : this.normalizeDate(new Date());

    const filter: any = {
      date: {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
    };
    if (query.attendeeType) filter.attendeeType = query.attendeeType;
    if (query.attendeeId && Types.ObjectId.isValid(query.attendeeId)) {
      filter.attendeeId = query.attendeeId;
    }

    const records = await this.attendanceModel.find(filter).exec();
    const statusCounts = {
      [AttendanceStatus.PRESENT]: 0,
      [AttendanceStatus.ABSENT]: 0,
      [AttendanceStatus.LEAVE]: 0,
    };
    const typeCounts = {
      [AttendanceType.STUDENT]: 0,
      [AttendanceType.TEACHER]: 0,
      [AttendanceType.STAFF]: 0,
    };

    records.forEach((record) => {
      statusCounts[record.status] += 1;
      typeCounts[record.attendeeType] += 1;
    });

    return {
      date: date.toISOString().split('T')[0],
      totalRecords: records.length,
      statusCounts,
      typeCounts,
    };
  }

  async getMonthlyReport(
    query: AttendanceReportQueryDto,
  ): Promise<Record<string, any>> {
    const now = new Date();
    const year = query.year || now.getUTCFullYear();
    const month = query.month || now.getUTCMonth() + 1;
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const filter: any = {
      date: {
        $gte: start,
        $lt: end,
      },
    };
    if (query.attendeeType) filter.attendeeType = query.attendeeType;
    if (query.attendeeId && Types.ObjectId.isValid(query.attendeeId)) {
      filter.attendeeId = query.attendeeId;
    }

    const records = await this.attendanceModel.find(filter).exec();
    const statusCounts = {
      [AttendanceStatus.PRESENT]: 0,
      [AttendanceStatus.ABSENT]: 0,
      [AttendanceStatus.LEAVE]: 0,
    };

    const dailySummary: Record<string, any> = {};
    records.forEach((record) => {
      const dayKey = record.date.toISOString().split('T')[0];
      if (!dailySummary[dayKey]) {
        dailySummary[dayKey] = {
          date: dayKey,
          present: 0,
          absent: 0,
          leave: 0,
          total: 0,
        };
      }
      dailySummary[dayKey].total += 1;
      dailySummary[dayKey][record.status.toLowerCase()] += 1;
      statusCounts[record.status] += 1;
    });

    return {
      month,
      year,
      totalRecords: records.length,
      statusCounts,
      dailySummary: Object.values(dailySummary),
    };
  }
}
