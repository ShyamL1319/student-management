import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assignment, AssignmentDocument } from './schemas/assignment.schema';
import { AssignmentSubmission, AssignmentSubmissionDocument } from './schemas/assignment-submission.schema';
import { CreateAssignmentDto, SubmitAssignmentDto, GradeSubmissionDto } from './dto/assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name) private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(AssignmentSubmission.name) private submissionModel: Model<AssignmentSubmissionDocument>,
  ) {}

  async create(teacherId: string, schoolId: string, dto: CreateAssignmentDto): Promise<Assignment> {
    return this.assignmentModel.create({
      school: new Types.ObjectId(schoolId),
      title: dto.title,
      description: dto.description,
      subject: new Types.ObjectId(dto.subjectId),
      class: new Types.ObjectId(dto.classId),
      teacher: new Types.ObjectId(teacherId),
      dueDate: new Date(dto.dueDate),
      maxMarks: dto.maxMarks ?? 100,
      isPublished: true,
    });
  }

  async findAll(schoolId: string, query: any): Promise<{ data: Assignment[]; total: number }> {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { school: new Types.ObjectId(schoolId) };
    if (query.classId) {
      filter.class = new Types.ObjectId(query.classId);
    }
    if (query.teacherId) {
      filter.teacher = new Types.ObjectId(query.teacherId);
    }
    if (query.search) {
      filter.title = { $regex: query.search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.assignmentModel
        .find(filter)
        .populate('subject', 'name code')
        .populate('class', 'name')
        .populate('teacher', 'firstName lastName')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.assignmentModel.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string, schoolId: string): Promise<Assignment> {
    const item = await this.assignmentModel
      .findOne({ _id: new Types.ObjectId(id), school: new Types.ObjectId(schoolId) })
      .populate('subject', 'name code')
      .populate('class', 'name')
      .populate('teacher', 'firstName lastName')
      .exec();
    if (!item) {
      throw new NotFoundException('Assignment not found');
    }
    return item;
  }

  async submit(studentId: string, schoolId: string, assignmentId: string, dto: SubmitAssignmentDto): Promise<AssignmentSubmission> {
    const assignment = await this.assignmentModel.findById(assignmentId).exec();
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const existingSubmission = await this.submissionModel.findOne({
      assignment: new Types.ObjectId(assignmentId),
      student: new Types.ObjectId(studentId),
    }).exec();

    if (existingSubmission) {
      existingSubmission.fileUrl = dto.fileUrl || '';
      existingSubmission.submittedAt = new Date();
      existingSubmission.status = 'Submitted';
      return existingSubmission.save();
    }

    return this.submissionModel.create({
      school: new Types.ObjectId(schoolId),
      assignment: new Types.ObjectId(assignmentId),
      student: new Types.ObjectId(studentId),
      fileUrl: dto.fileUrl || '',
      submittedAt: new Date(),
      status: 'Submitted',
    });
  }

  async grade(teacherId: string, schoolId: string, submissionId: string, dto: GradeSubmissionDto): Promise<AssignmentSubmission> {
    const submission = await this.submissionModel
      .findOne({ _id: new Types.ObjectId(submissionId), school: new Types.ObjectId(schoolId) })
      .populate('assignment')
      .exec();

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const maxMarks = (submission.assignment as any).maxMarks || 100;
    if (dto.marksObtained > maxMarks) {
      throw new BadRequestException(`Marks obtained cannot exceed max marks of ${maxMarks}`);
    }

    submission.marksObtained = dto.marksObtained;
    submission.feedback = dto.feedback || '';
    submission.status = 'Graded';

    return submission.save();
  }

  async getSubmissions(schoolId: string, assignmentId: string): Promise<AssignmentSubmission[]> {
    return this.submissionModel
      .find({ assignment: new Types.ObjectId(assignmentId), school: new Types.ObjectId(schoolId) })
      .populate('student', 'firstName lastName email')
      .sort({ submittedAt: -1 })
      .exec();
  }

  async remove(id: string, schoolId: string): Promise<void> {
    const result = await this.assignmentModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), school: new Types.ObjectId(schoolId) })
      .exec();
    if (!result) {
      throw new NotFoundException('Assignment not found');
    }

    // Also remove associated submissions
    await this.submissionModel.deleteMany({ assignment: new Types.ObjectId(id) }).exec();
  }
}
