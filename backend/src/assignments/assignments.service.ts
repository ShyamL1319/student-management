import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assignment, AssignmentDocument } from './schemas/assignment.schema';
import { 
  AssignmentSubmission, 
  AssignmentSubmissionDocument 
} from './schemas/assignment-submission.schema';
import { 
  CreateAssignmentDto, 
  UpdateAssignmentDto,
  SubmitAssignmentDto, 
  GradeSubmissionDto,
  BulkGradeSubmissionDto 
} from './dto/assignment.dto';
import { RoleEnum } from '../common/enums/role.enum';
import { NotificationService } from '../notifications/services/notification.service';
import { NotificationEventType, NotificationChannel } from '../notifications/schemas/notification.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditStatus } from '../audit-logs/schemas/audit-log.schema';
import { Mark, MarkDocument } from '../marks/schemas/mark.schema';

// Helper mock S3 client for presigned URL generation since S3 client package is not installed
class LocalPresignedUrlGenerator {
  getPresignedPostUrl(key: string, type: string) {
    return {
      url: `https://school-lms-bucket.s3.amazonaws.com/`,
      fields: {
        key,
        'Content-Type': type,
        AWSAccessKeyId: 'mockKey',
        policy: 'mockPolicy',
        signature: 'mockSignature',
      }
    };
  }
}

@Injectable()
export class AssignmentsService {
  private s3Generator = new LocalPresignedUrlGenerator();

  constructor(
    @InjectModel(Assignment.name) private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(AssignmentSubmission.name) private submissionModel: Model<AssignmentSubmissionDocument>,
    @InjectModel(Mark.name) private markModel: Model<MarkDocument>,
    private readonly notificationService: NotificationService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(teacherId: string, schoolId: string, dto: CreateAssignmentDto): Promise<Assignment> {
    const assignment = await this.assignmentModel.create({
      school: new Types.ObjectId(schoolId),
      title: dto.title,
      description: dto.description,
      subject: new Types.ObjectId(dto.subjectId),
      class: new Types.ObjectId(dto.classId),
      teacher: new Types.ObjectId(teacherId),
      dueDate: new Date(dto.dueDate),
      maxMarks: dto.maxMarks ?? 100,
      attachmentUrl: dto.attachmentUrl,
      attachmentName: dto.attachmentName,
      isPublished: dto.isPublished ?? false,
      latePolicy: dto.latePolicy ?? {
        allowLate: true,
        gracePeriodMinutes: 0,
        penaltyPercentagePerDay: 0,
        maxPenaltyPercentage: 50,
      },
    });

    await this.auditLogsService.create({
      action: AuditAction.CREATE,
      entityType: 'Assignment',
      entityId: assignment._id.toString(),
      performedBy: new Types.ObjectId(teacherId),
      status: AuditStatus.SUCCESS,
      changes: dto,
    });

    if (assignment.isPublished) {
      await this.triggerPublishNotifications(assignment);
    }

    return assignment;
  }

  async findAll(
    schoolId: string, 
    query: any, 
    userId: string, 
    role: string
  ): Promise<{ data: any[]; total: number }> {
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
    if (query.isPublished !== undefined) {
      filter.isPublished = query.isPublished === 'true';
    }
    if (query.search) {
      filter.title = { $regex: query.search, $options: 'i' };
    }

    const [rawAssignments, total] = await Promise.all([
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

    let data = rawAssignments.map(a => a.toObject());
    if (role === RoleEnum.STUDENT) {
      const assignmentIds = data.map(a => a._id);
      const studentSubmissions = await this.submissionModel.find({
        student: new Types.ObjectId(userId),
        assignment: { $in: assignmentIds },
      }).exec();

      const submissionMap = new Map(studentSubmissions.map(s => [s.assignment.toString(), s]));
      data = data.map(a => ({
        ...a,
        submission: submissionMap.get(a._id.toString()) || null,
      }));
    }

    return { data, total };
  }

  async findOne(id: string, schoolId: string, userId: string, role: string): Promise<any> {
    const item = await this.assignmentModel
      .findOne({ _id: new Types.ObjectId(id), school: new Types.ObjectId(schoolId) })
      .populate('subject', 'name code')
      .populate('class', 'name')
      .populate('teacher', 'firstName lastName')
      .exec();

    if (!item) {
      throw new NotFoundException('Assignment not found');
    }

    if (!item.isPublished && role === RoleEnum.STUDENT) {
      throw new ForbiddenException('Draft assignments are not accessible to students');
    }

    const result = item.toObject();

    if (role === RoleEnum.STUDENT) {
      const sub = await this.submissionModel.findOne({
        student: new Types.ObjectId(userId),
        assignment: item._id,
      }).exec();
      result.submission = sub || null;
    }

    return result;
  }

  async update(
    id: string, 
    schoolId: string, 
    teacherId: string, 
    role: string, 
    dto: UpdateAssignmentDto
  ): Promise<Assignment> {
    const assignment = await this.assignmentModel.findOne({
      _id: new Types.ObjectId(id),
      school: new Types.ObjectId(schoolId),
    }).exec();

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (role === RoleEnum.TEACHER && assignment.teacher.toString() !== teacherId) {
      throw new ForbiddenException('You can only edit your own assignments');
    }

    const wasPublished = assignment.isPublished;

    Object.assign(assignment, {
      title: dto.title ?? assignment.title,
      description: dto.description ?? assignment.description,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : assignment.dueDate,
      maxMarks: dto.maxMarks ?? assignment.maxMarks,
      attachmentUrl: dto.attachmentUrl ?? assignment.attachmentUrl,
      attachmentName: dto.attachmentName ?? assignment.attachmentName,
      isPublished: dto.isPublished ?? assignment.isPublished,
      latePolicy: dto.latePolicy ?? assignment.latePolicy,
    });

    if (dto.subjectId) assignment.subject = new Types.ObjectId(dto.subjectId);
    if (dto.classId) assignment.class = new Types.ObjectId(dto.classId);

    const saved = await assignment.save();

    await this.auditLogsService.create({
      action: AuditAction.UPDATE,
      entityType: 'Assignment',
      entityId: saved._id.toString(),
      performedBy: new Types.ObjectId(teacherId),
      status: AuditStatus.SUCCESS,
      changes: dto,
    });

    if (!wasPublished && saved.isPublished) {
      await this.triggerPublishNotifications(saved);
    }

    return saved;
  }

  async publish(id: string, schoolId: string, teacherId: string, role: string): Promise<Assignment> {
    return this.update(id, schoolId, teacherId, role, { isPublished: true } as any);
  }

  async submit(
    studentId: string, 
    schoolId: string, 
    assignmentId: string, 
    dto: SubmitAssignmentDto
  ): Promise<AssignmentSubmission> {
    const assignment = await this.assignmentModel.findOne({
      _id: new Types.ObjectId(assignmentId),
      school: new Types.ObjectId(schoolId),
    }).exec();

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (!assignment.isPublished) {
      throw new BadRequestException('Cannot submit to a draft assignment');
    }

    const now = new Date();
    const isLate = now.getTime() > (assignment.dueDate.getTime() + (assignment.latePolicy.gracePeriodMinutes * 60 * 1000));

    if (isLate && !assignment.latePolicy.allowLate) {
      throw new BadRequestException('Submissions are closed. Late submissions are not allowed for this assignment.');
    }

    const newAttempt = {
      fileUrl: dto.fileUrl,
      fileName: dto.fileName,
      fileSize: dto.fileSize,
      submittedAt: now,
      isLate,
    };

    let submission = await this.submissionModel.findOne({
      assignment: assignment._id,
      student: new Types.ObjectId(studentId),
    }).exec();

    if (submission) {
      submission.fileUrl = dto.fileUrl;
      submission.fileName = dto.fileName;
      submission.fileSize = dto.fileSize;
      submission.submittedAt = now;
      submission.isLate = isLate;
      submission.status = 'Submitted';
      submission.attempts.push(newAttempt);
      
      submission = await submission.save();
    } else {
      submission = await this.submissionModel.create({
        school: new Types.ObjectId(schoolId),
        assignment: assignment._id,
        student: new Types.ObjectId(studentId),
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
        fileSize: dto.fileSize,
        submittedAt: now,
        isLate,
        status: 'Submitted',
        attempts: [newAttempt],
      });
    }

    await this.auditLogsService.create({
      action: AuditAction.UPDATE,
      entityType: 'AssignmentSubmission',
      entityId: submission._id.toString(),
      performedBy: new Types.ObjectId(studentId),
      status: AuditStatus.SUCCESS,
      changes: { fileUrl: dto.fileUrl, fileName: dto.fileName, isLate },
    });

    await this.notificationService.create({
      recipientId: assignment.teacher,
      eventType: NotificationEventType.ANNOUNCEMENT,
      channel: NotificationChannel.IN_APP,
      subject: 'New Assignment Submission',
      message: `A student submitted work for: "${assignment.title}"`,
      templateData: { assignmentId: assignment._id.toString() },
      relatedEntityId: submission._id,
      relatedEntityType: 'AssignmentSubmission',
    });

    return submission;
  }

  async grade(
    teacherId: string, 
    schoolId: string, 
    submissionId: string, 
    dto: GradeSubmissionDto
  ): Promise<AssignmentSubmission> {
    const submission = await this.submissionModel
      .findOne({ _id: new Types.ObjectId(submissionId), school: new Types.ObjectId(schoolId) })
      .populate('assignment')
      .exec();

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const assignment = submission.assignment as any as Assignment;
    if (dto.marksObtained > assignment.maxMarks) {
      throw new BadRequestException(`Marks obtained (${dto.marksObtained}) cannot exceed max marks of ${assignment.maxMarks}`);
    }

    let finalScore = dto.marksObtained;
    let penaltyAmount = 0;

    if (submission.isLate && assignment.latePolicy.penaltyPercentagePerDay > 0) {
      const timeDiffMs = submission.submittedAt.getTime() - assignment.dueDate.getTime();
      const daysLate = Math.ceil(timeDiffMs / (1000 * 60 * 60 * 24));
      
      const penaltyPercent = Math.min(
        daysLate * assignment.latePolicy.penaltyPercentagePerDay, 
        assignment.latePolicy.maxPenaltyPercentage
      );
      
      penaltyAmount = Math.round((assignment.maxMarks * penaltyPercent) / 100);
      finalScore = Math.max(0, finalScore - penaltyAmount);
    }

    submission.marksObtained = finalScore;
    submission.latePenaltyDeducted = penaltyAmount;
    submission.feedback = dto.feedback;
    submission.status = 'Graded';
    submission.gradedBy = new Types.ObjectId(teacherId);
    submission.gradedAt = new Date();

    const saved = await submission.save();

    await this.syncToGradebook(
      schoolId, 
      submission.student.toString(), 
      assignment.subject.toString(), 
      (assignment as any)._id.toString(), 
      finalScore, 
      assignment.maxMarks
    );

    await this.notificationService.create({
      recipientId: submission.student,
      eventType: NotificationEventType.RESULT_ALERT,
      channel: NotificationChannel.IN_APP,
      subject: 'Assignment Graded',
      message: `Your assignment "${assignment.title}" has been evaluated. Score: ${finalScore}/${assignment.maxMarks}.`,
      templateData: { marks: finalScore, maxMarks: assignment.maxMarks },
      relatedEntityId: submission._id,
      relatedEntityType: 'AssignmentSubmission',
    });

    return saved;
  }

  async bulkGrade(
    teacherId: string, 
    schoolId: string, 
    assignmentId: string, 
    dto: BulkGradeSubmissionDto
  ): Promise<any> {
    const results = [];
    for (const item of dto.grades) {
      try {
        const graded = await this.grade(teacherId, schoolId, item.submissionId, {
          marksObtained: item.marksObtained,
          feedback: item.feedback,
        });
        results.push({ submissionId: item.submissionId, status: 'Success', id: graded._id });
      } catch (err: any) {
        results.push({ submissionId: item.submissionId, status: 'Failed', reason: err.message });
      }
    }
    return { results };
  }

  async getSubmissions(
    schoolId: string, 
    assignmentId: string, 
    userId: string, 
    role: string
  ): Promise<AssignmentSubmission[]> {
    const assignment = await this.assignmentModel.findOne({
      _id: new Types.ObjectId(assignmentId),
      school: new Types.ObjectId(schoolId),
    }).exec();

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (role === RoleEnum.TEACHER && assignment.teacher.toString() !== userId) {
      throw new ForbiddenException('You can only view submissions for your own assignments');
    }

    return this.submissionModel
      .find({ assignment: assignment._id, school: new Types.ObjectId(schoolId) })
      .populate('student', 'firstName lastName email')
      .sort({ submittedAt: -1 })
      .exec();
  }

  async getAnalytics(assignmentId: string, schoolId: string): Promise<any> {
    const assignment = await this.assignmentModel.findOne({
      _id: new Types.ObjectId(assignmentId),
      school: new Types.ObjectId(schoolId),
    }).exec();

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const submissions = await this.submissionModel.find({
      assignment: assignment._id,
      status: 'Graded',
    }).exec();

    if (submissions.length === 0) {
      return {
        totalEvaluated: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        submissionRate: 0,
      };
    }

    const scores = submissions.map(s => s.marksObtained || 0);
    const sum = scores.reduce((a, b) => a + b, 0);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const avg = Math.round((sum / scores.length) * 100) / 100;

    const totalStudents = await this.submissionModel.countDocuments({
      assignment: assignment._id,
    }).exec();

    return {
      totalEvaluated: submissions.length,
      averageScore: avg,
      highestScore: highest,
      lowestScore: lowest,
      submissionRate: totalStudents > 0 ? Math.round((submissions.length / totalStudents) * 100) : 0,
    };
  }

  async remove(id: string, schoolId: string, teacherId: string, role: string): Promise<void> {
    const query: Record<string, any> = { _id: new Types.ObjectId(id), school: new Types.ObjectId(schoolId) };
    if (role === RoleEnum.TEACHER) {
      query.teacher = new Types.ObjectId(teacherId);
    }

    const result = await this.assignmentModel.findOneAndDelete(query).exec();
    if (!result) {
      throw new NotFoundException('Assignment not found or permission denied');
    }

    await this.submissionModel.deleteMany({ assignment: result._id }).exec();

    await this.auditLogsService.create({
      action: AuditAction.DELETE,
      entityType: 'Assignment',
      entityId: id,
      performedBy: new Types.ObjectId(teacherId),
      status: AuditStatus.SUCCESS,
    });
  }

  async generatePresignedUploadUrl(
    schoolId: string, 
    assignmentId: string, 
    userId: string, 
    fileName: string
  ): Promise<any> {
    const key = `tenants/${schoolId}/assignments/${assignmentId}/students/${userId}/${Date.now()}-${fileName}`;
    const contentType = this.getContentTypeByFileName(fileName);
    
    return this.s3Generator.getPresignedPostUrl(key, contentType);
  }

  private getContentTypeByFileName(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'application/pdf';
    if (ext === 'zip') return 'application/zip';
    if (ext === 'png') return 'image/png';
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    return 'application/octet-stream';
  }

  private async syncToGradebook(
    schoolId: string, 
    studentId: string, 
    subjectId: string, 
    assignmentId: string, 
    marks: number, 
    maxMarks: number
  ) {
    await this.markModel.updateOne(
      {
        studentId,
        subjectId,
        examId: `assignment-${assignmentId}`,
      },
      {
        studentId,
        subjectId,
        examId: `assignment-${assignmentId}`,
        marksObtained: marks,
        maxMarks,
        grade: this.calculateGrade(marks, maxMarks),
      },
      { upsert: true }
    ).exec();
  }

  private calculateGrade(score: number, max: number): string {
    const pct = (score / max) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  }

  private async triggerPublishNotifications(assignment: Assignment) {
    const mockStudentId = new Types.ObjectId(); // Mock recipient since dynamic database query is scoped
    
    await this.notificationService.create({
      recipientId: mockStudentId,
      eventType: NotificationEventType.ANNOUNCEMENT,
      channel: NotificationChannel.EMAIL,
      subject: 'New Assignment Published',
      message: `A new assignment "${assignment.title}" has been published. Due date: ${assignment.dueDate.toLocaleDateString()}`,
      templateData: { assignmentId: (assignment as any)._id.toString() },
      relatedEntityId: (assignment as any)._id,
      relatedEntityType: 'Assignment',
    });
  }
}

