import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student, StudentDocument } from './schemas/student.schema';
import { Department, DepartmentDocument } from '../departments/schemas/department.schema';

export interface PaginatedStudents {
  items: StudentDocument[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    @InjectModel(Student.name) private readonly studentModel: Model<StudentDocument>,
    @InjectModel(Department.name) private readonly departmentModel: Model<DepartmentDocument>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<StudentDocument> {
    const department = await this.departmentModel.findById(createStudentDto.department).exec();
    if (!department) {
      throw new NotFoundException(`Department with ID ${createStudentDto.department} not found`);
    }

    await this.ensureUniqueConstraints(createStudentDto.email, createStudentDto.studentId);
    
    const student = await this.studentModel.create({
      ...createStudentDto,
      email: createStudentDto.email.toLowerCase(),
    });

    this.logger.log(`Created student ${student.email}`);
    return student;
  }

  async findAll(query: ListStudentsQueryDto): Promise<PaginatedStudents> {
    const filter: FilterQuery<StudentDocument> = { isDeleted: false };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const search = query.search.trim();
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { studentId: new RegExp(search, 'i') },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.studentModel.find(filter).populate('department', 'name code').sort({ createdAt: -1 }).skip(skip).limit(query.limit).exec(),
      this.studentModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async findOne(id: string): Promise<StudentDocument> {
    const student = await this.studentModel.findOne({ _id: id, isDeleted: false }).populate('department', 'name code').exec();

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<StudentDocument> {
    if (updateStudentDto.department) {
      const department = await this.departmentModel.findById(updateStudentDto.department).exec();
      if (!department) {
        throw new NotFoundException(`Department with ID ${updateStudentDto.department} not found`);
      }
    }

    if (updateStudentDto.email || updateStudentDto.studentId) {
      await this.ensureUniqueConstraints(updateStudentDto.email, updateStudentDto.studentId, id);
    }

    const student = await this.studentModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          ...updateStudentDto,
          ...(updateStudentDto.email && { email: updateStudentDto.email.toLowerCase() }),
        },
        { new: true, runValidators: true },
      )
      .populate('department', 'name code')
      .exec();

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async remove(id: string): Promise<{ id: string }> {
    const student = await this.studentModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return { id };
  }

  private async ensureUniqueConstraints(email?: string, studentId?: string, excludeId?: string): Promise<void> {
    if (email) {
      const filterEmail: FilterQuery<StudentDocument> = { email: email.toLowerCase(), isDeleted: false };
      if (excludeId) filterEmail._id = { $ne: excludeId };
      const existingEmail = await this.studentModel.exists(filterEmail);
      if (existingEmail) throw new ConflictException('A student with this email already exists');
    }

    if (studentId) {
      const filterId: FilterQuery<StudentDocument> = { studentId, isDeleted: false };
      if (excludeId) filterId._id = { $ne: excludeId };
      const existingStudentId = await this.studentModel.exists(filterId);
      if (existingStudentId) throw new ConflictException('A student with this studentId already exists');
    }
  }
}
