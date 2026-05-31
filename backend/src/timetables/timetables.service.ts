/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Timetable,
  TimetableDocument,
  DayOfWeek,
} from './schemas/timetable.schema';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import {
  CheckConflictDto,
  ConflictResponseDto,
} from './dto/check-conflict.dto';

@Injectable()
export class TimetablesService {
  constructor(
    @InjectModel(Timetable.name)
    private timetableModel: Model<TimetableDocument>,
  ) {}

  /**
   * Create a new timetable entry with conflict detection
   */
  async create(
    createTimetableDto: CreateTimetableDto,
  ): Promise<TimetableDocument> {
    // Validate time format
    this.validateTimeFormat(createTimetableDto.startTime);
    this.validateTimeFormat(createTimetableDto.endTime);

    // Check if end time is after start time
    if (
      !this.isValidTimeRange(
        createTimetableDto.startTime,
        createTimetableDto.endTime,
      )
    ) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for conflicts before creating
    const conflicts = await this.detectConflicts({
      teacher: createTimetableDto.teacher,
      class: createTimetableDto.class,
      dayOfWeek: createTimetableDto.dayOfWeek,
      startTime: createTimetableDto.startTime,
      endTime: createTimetableDto.endTime,
    });

    if (conflicts.hasConflict) {
      throw new BadRequestException(
        `Scheduling conflict detected: ${JSON.stringify(conflicts.conflicts)}`,
      );
    }

    return this.timetableModel.create(createTimetableDto);
  }

  /**
   * Find all timetables with filters
   */
  async findAll(query: any): Promise<{ data: any[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      class: classId,
      teacher,
      dayOfWeek,
      academicYear,
      section,
      isActive = true,
    } = query;

    const q: any = {};

    if (classId) q.class = Types.ObjectId.isValid(classId) ? classId : classId;
    if (teacher) q.teacher = Types.ObjectId.isValid(teacher) ? teacher : teacher;
    if (dayOfWeek) q.dayOfWeek = dayOfWeek;
    if (academicYear)
      q.academicYear = Types.ObjectId.isValid(academicYear)
        ? academicYear
        : academicYear;
    if (section) q.section = Types.ObjectId.isValid(section) ? section : section;
    if (typeof isActive !== 'undefined') q.isActive = isActive === 'true' || isActive === true;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.timetableModel
        .find(q)
        .populate('class', 'name')
        .populate('teacher', 'firstName lastName')
        .populate('subject', 'name')
        .populate('section', 'name')
        .populate('academicYear', 'name startDate endDate')
        .sort({ dayOfWeek: 1, startTime: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.timetableModel.countDocuments(q),
    ]);

    return { data, total };
  }

  /**
   * Get class timetable for a specific week/day
   */
  async getClassTimetable(classId: string, query: any = {}): Promise<any[]> {
    const { academicYear, dayOfWeek } = query;

    const q: any = {
      class: Types.ObjectId.isValid(classId) ? classId : classId,
      isActive: true,
    };

    if (academicYear)
      q.academicYear = Types.ObjectId.isValid(academicYear)
        ? academicYear
        : academicYear;
    if (dayOfWeek) q.dayOfWeek = dayOfWeek;

    return this.timetableModel
      .find(q)
      .populate('teacher', 'firstName lastName')
      .populate('subject', 'name')
      .populate('section', 'name')
      .sort({ dayOfWeek: 1, startTime: 1 })
      .exec();
  }

  /**
   * Get teacher's timetable
   */
  async getTeacherTimetable(
    teacherId: string,
    query: any = {},
  ): Promise<any[]> {
    const { academicYear, dayOfWeek } = query;

    const q: any = {
      teacher: Types.ObjectId.isValid(teacherId) ? teacherId : teacherId,
      isActive: true,
    };

    if (academicYear)
      q.academicYear = Types.ObjectId.isValid(academicYear)
        ? academicYear
        : academicYear;
    if (dayOfWeek) q.dayOfWeek = dayOfWeek;

    return this.timetableModel
      .find(q)
      .populate('class', 'name')
      .populate('subject', 'name')
      .populate('section', 'name')
      .sort({ dayOfWeek: 1, startTime: 1 })
      .exec();
  }

  /**
   * Get weekly timetable for a class
   */
  async getWeeklyTimetable(classId: string, query: any = {}): Promise<any> {
    const { academicYear } = query;

    const q: any = {
      class: Types.ObjectId.isValid(classId) ? classId : classId,
      isActive: true,
    };

    if (academicYear)
      q.academicYear = Types.ObjectId.isValid(academicYear)
        ? academicYear
        : academicYear;

    const timetables = await this.timetableModel
      .find(q)
      .populate('teacher', 'firstName lastName')
      .populate('subject', 'name')
      .populate('section', 'name')
      .exec();

    // Group by day of week
    const weeklySchedule: any = {};
    const days = [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];

    days.forEach((day) => {
      weeklySchedule[day] = timetables
        .filter((t) => t.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return weeklySchedule;
  }

  /**
   * Find single timetable
   */
  async findOne(id: string): Promise<TimetableDocument> {
    const timetable = await this.timetableModel
      .findById(id)
      .populate('class', 'name')
      .populate('teacher', 'firstName lastName')
      .populate('subject', 'name')
      .populate('section', 'name')
      .populate('academicYear', 'name startDate endDate')
      .exec();

    if (!timetable) {
      throw new NotFoundException(`Timetable with ID ${id} not found`);
    }

    return timetable;
  }

  /**
   * Update timetable with conflict detection
   */
  async update(
    id: string,
    updateTimetableDto: UpdateTimetableDto,
  ): Promise<TimetableDocument> {
    const timetable = await this.findOne(id);

    // Validate time format if times are being updated
    if (updateTimetableDto.startTime) {
      this.validateTimeFormat(updateTimetableDto.startTime);
    }
    if (updateTimetableDto.endTime) {
      this.validateTimeFormat(updateTimetableDto.endTime);
    }

    const startTime = updateTimetableDto.startTime || timetable.startTime;
    const endTime = updateTimetableDto.endTime || timetable.endTime;

    if (!this.isValidTimeRange(startTime, endTime)) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for conflicts (excluding this timetable)
    if (
      updateTimetableDto.teacher ||
      updateTimetableDto.class ||
      updateTimetableDto.dayOfWeek ||
      updateTimetableDto.startTime ||
      updateTimetableDto.endTime
    ) {
      const teacherId =
        updateTimetableDto.teacher ||
        (timetable.teacher as any)._id?.toString() ||
        timetable.teacher;
      const classId =
        updateTimetableDto.class ||
        (timetable.class as any)._id?.toString() ||
        timetable.class;
      const dayOfWeek = updateTimetableDto.dayOfWeek || timetable.dayOfWeek;

      const conflicts = await this.detectConflicts({
        teacher: teacherId.toString(),
        class: classId.toString(),
        dayOfWeek,
        startTime,
        endTime,
        excludeTimetableId: id,
      });

      if (conflicts.hasConflict) {
        throw new BadRequestException(
          `Scheduling conflict detected: ${JSON.stringify(conflicts.conflicts)}`,
        );
      }
    }

    const updatedTimetable = await this.timetableModel
      .findByIdAndUpdate(id, updateTimetableDto, { new: true })
      .populate('class', 'name')
      .populate('teacher', 'firstName lastName')
      .populate('subject', 'name')
      .populate('section', 'name')
      .populate('academicYear', 'name startDate endDate')
      .exec();

    if (!updatedTimetable) {
      throw new NotFoundException(
        `Timetable with ID ${id} not found after update`,
      );
    }

    return updatedTimetable;
  }

  /**
   * Delete timetable
   */
  async remove(id: string): Promise<TimetableDocument> {
    await this.findOne(id);
    const deleted = await this.timetableModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Timetable with ID ${id} not found`);
    }
    return deleted;
  }

  /**
   * Detect scheduling conflicts
   */
  async detectConflicts(
    checkConflictDto: Omit<CheckConflictDto, 'excludeTimetableId'> & {
      excludeTimetableId?: string;
    },
  ): Promise<ConflictResponseDto> {
    const {
      teacher,
      class: classId,
      dayOfWeek,
      startTime,
      endTime,
      excludeTimetableId,
    } = checkConflictDto;

    const conflicts: any[] = [];

    // Check teacher double booking
    const teacherConflicts = await this.timetableModel
      .find({
        teacher: Types.ObjectId.isValid(teacher) ? teacher : teacher,
        dayOfWeek,
        isActive: true,
        ...(excludeTimetableId && { _id: { $ne: excludeTimetableId } }),
      })
      .populate('class', 'name')
      .populate('teacher', 'firstName lastName')
      .populate('subject', 'name')
      .exec();

    for (const conflict of teacherConflicts) {
      if (
        this.hasTimeOverlap(
          startTime,
          endTime,
          conflict.startTime,
          conflict.endTime,
        )
      ) {
        conflicts.push({
          timetableId: conflict._id.toString(),
          class: (conflict.class as any).name,
          teacher: `${(conflict.teacher as any).firstName} ${(conflict.teacher as any).lastName}`,
          subject: (conflict.subject as any).name,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
          dayOfWeek: conflict.dayOfWeek,
          conflictType: 'TEACHER_DOUBLE_BOOKING',
        });
      }
    }

    // Check class overlap
    const classConflicts = await this.timetableModel
      .find({
        class: Types.ObjectId.isValid(classId) ? classId : classId,
        dayOfWeek,
        isActive: true,
        ...(excludeTimetableId && { _id: { $ne: excludeTimetableId } }),
      })
      .populate('class', 'name')
      .populate('teacher', 'firstName lastName')
      .populate('subject', 'name')
      .exec();

    for (const conflict of classConflicts) {
      if (
        this.hasTimeOverlap(
          startTime,
          endTime,
          conflict.startTime,
          conflict.endTime,
        )
      ) {
        // Only add if not already in conflicts (to avoid duplicates)
        if (
          !conflicts.some(
            (c) =>
              c.timetableId === conflict._id.toString() &&
              c.conflictType === 'CLASS_OVERLAP',
          )
        ) {
          conflicts.push({
            timetableId: conflict._id.toString(),
            class: (conflict.class as any).name,
            teacher: `${(conflict.teacher as any).firstName} ${(conflict.teacher as any).lastName}`,
            subject: (conflict.subject as any).name,
            startTime: conflict.startTime,
            endTime: conflict.endTime,
            dayOfWeek: conflict.dayOfWeek,
            conflictType: 'CLASS_OVERLAP',
          });
        }
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Helper method to check time overlap
   */
  private hasTimeOverlap(
    startTime1: string,
    endTime1: string,
    startTime2: string,
    endTime2: string,
  ): boolean {
    const start1 = this.timeToMinutes(startTime1);
    const end1 = this.timeToMinutes(endTime1);
    const start2 = this.timeToMinutes(startTime2);
    const end2 = this.timeToMinutes(endTime2);

    return start1 < end2 && end1 > start2;
  }

  /**
   * Helper method to convert time to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Helper method to validate time format
   */
  private validateTimeFormat(time: string): void {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new BadRequestException(
        `Invalid time format: ${time}. Expected HH:mm`,
      );
    }
  }

  /**
   * Helper method to validate time range
   */
  private isValidTimeRange(startTime: string, endTime: string): boolean {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    return end > start;
  }

  /**
   * Bulk operations for timetable generation
   */
  async bulkCreate(timetables: CreateTimetableDto[]): Promise<any[]> {
    // Validate all timetables first
    for (const timetable of timetables) {
      this.validateTimeFormat(timetable.startTime);
      this.validateTimeFormat(timetable.endTime);

      if (!this.isValidTimeRange(timetable.startTime, timetable.endTime)) {
        throw new BadRequestException(
          `Invalid time range for timetable: ${timetable.startTime} to ${timetable.endTime}`,
        );
      }
    }

    // Check for internal conflicts within the batch
    for (let i = 0; i < timetables.length; i++) {
      for (let j = i + 1; j < timetables.length; j++) {
        const t1 = timetables[i];
        const t2 = timetables[j];

        if (
          t1.teacher === t2.teacher &&
          t1.dayOfWeek === t2.dayOfWeek &&
          this.hasTimeOverlap(
            t1.startTime,
            t1.endTime,
            t2.startTime,
            t2.endTime,
          )
        ) {
          throw new BadRequestException(
            `Conflict detected in batch: Teacher has overlapping classes`,
          );
        }

        if (
          t1.class === t2.class &&
          t1.dayOfWeek === t2.dayOfWeek &&
          this.hasTimeOverlap(
            t1.startTime,
            t1.endTime,
            t2.startTime,
            t2.endTime,
          )
        ) {
          throw new BadRequestException(
            `Conflict detected in batch: Class has overlapping classes`,
          );
        }
      }
    }

    return this.timetableModel.insertMany(timetables);
  }
}
