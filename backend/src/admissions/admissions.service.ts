import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AdmissionApplication, AdmissionApplicationDocument, AdmissionStage } from './schemas/admission.schema';
import { CreateAdmissionDto, ScheduleInterviewDto, EvaluateApplicationDto, UpdateAdmissionStatusDto } from './dto/admission.dto';
import { StudentsService } from '../students/students.service';
import { ParentsService } from '../parents/parents.service';
import { InvoiceService } from '../fees/invoice.service';
import { NotificationService } from '../notifications/services/notification.service';
import { NotificationEventType, NotificationChannel } from '../notifications/schemas/notification.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditStatus } from '../audit-logs/schemas/audit-log.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role, RoleDocument } from '../roles/schemas/role.schema';

@Injectable()
export class AdmissionsService {
  constructor(
    @InjectModel(AdmissionApplication.name) private admissionModel: Model<AdmissionApplicationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    private readonly studentsService: StudentsService,
    private readonly parentsService: ParentsService,
    private readonly invoiceService: InvoiceService,
    private readonly notificationService: NotificationService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private isValidTransition(current: AdmissionStage, next: AdmissionStage): boolean {
    if (next === AdmissionStage.REJECTION) {
      return [
        AdmissionStage.SUBMITTED,
        AdmissionStage.VERIFICATION,
        AdmissionStage.INTERVIEW,
        AdmissionStage.EVALUATION,
        AdmissionStage.APPROVAL,
      ].includes(current);
    }

    switch (current) {
      case AdmissionStage.SUBMITTED:
        return next === AdmissionStage.VERIFICATION;
      case AdmissionStage.VERIFICATION:
        return next === AdmissionStage.INTERVIEW;
      case AdmissionStage.INTERVIEW:
        return next === AdmissionStage.EVALUATION;
      case AdmissionStage.EVALUATION:
        return next === AdmissionStage.APPROVAL;
      case AdmissionStage.APPROVAL:
        return next === AdmissionStage.ENROLLMENT;
      default:
        return false;
    }
  }

  async create(schoolId: string, dto: CreateAdmissionDto): Promise<AdmissionApplication> {
    const application = await this.admissionModel.create({
      school: new Types.ObjectId(schoolId),
      studentInfo: {
        firstName: dto.studentInfo.firstName,
        lastName: dto.studentInfo.lastName,
        dob: new Date(dto.studentInfo.dob),
        gender: dto.studentInfo.gender,
        bloodGroup: dto.studentInfo.bloodGroup,
        address: dto.studentInfo.address,
      },
      parentInfo: {
        firstName: dto.parentInfo.firstName,
        lastName: dto.parentInfo.lastName,
        email: dto.parentInfo.email.toLowerCase(),
        phone: dto.parentInfo.phone,
        relationship: dto.parentInfo.relationship,
        occupation: dto.parentInfo.occupation,
      },
      gradeLevel: dto.gradeLevel,
      status: AdmissionStage.SUBMITTED,
      documents: dto.documents || [],
      interviewDetails: {},
      scoring: {
        documentScore: 0,
        interviewScore: 0,
        entranceScore: 0,
        totalScore: 0,
      },
    });

    await this.auditLogsService.create({
      action: AuditAction.CREATE,
      entityType: 'AdmissionApplication',
      entityId: application._id.toString(),
      status: AuditStatus.SUCCESS,
      changes: dto,
    });

    return application;
  }

  async findAll(schoolId: string, query: any): Promise<{ data: AdmissionApplication[]; total: number }> {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { school: new Types.ObjectId(schoolId) };
    if (query.status) {
      filter.status = query.status;
    }
    if (query.search) {
      filter.$or = [
        { 'studentInfo.firstName': { $regex: query.search, $options: 'i' } },
        { 'studentInfo.lastName': { $regex: query.search, $options: 'i' } },
        { 'parentInfo.email': { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.gradeLevel) {
      filter.gradeLevel = query.gradeLevel;
    }

    const [data, total] = await Promise.all([
      this.admissionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.admissionModel.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string, schoolId: string): Promise<AdmissionApplication> {
    const item = await this.admissionModel
      .findOne({ _id: new Types.ObjectId(id), school: new Types.ObjectId(schoolId) })
      .exec();
    if (!item) {
      throw new NotFoundException('Admission application not found');
    }
    return item;
  }

  async updateStatus(
    id: string,
    schoolId: string,
    userId: string,
    dto: UpdateAdmissionStatusDto,
  ): Promise<AdmissionApplication> {
    const item = await this.admissionModel.findOne({
      _id: new Types.ObjectId(id),
      school: new Types.ObjectId(schoolId),
    }).exec();

    if (!item) {
      throw new NotFoundException('Admission application not found');
    }

    if (!this.isValidTransition(item.status, dto.status)) {
      throw new BadRequestException(
        `Invalid stage transition from "${item.status}" to "${dto.status}"`,
      );
    }

    const previousStatus = item.status;
    item.status = dto.status;
    const saved = await item.save();

    await this.auditLogsService.create({
      action: AuditAction.UPDATE,
      entityType: 'AdmissionApplication',
      entityId: saved._id.toString(),
      performedBy: userId,
      status: AuditStatus.SUCCESS,
      changes: { previousStatus, currentStatus: dto.status },
    });

    return saved;
  }

  async scheduleInterview(
    id: string,
    schoolId: string,
    userId: string,
    dto: ScheduleInterviewDto,
  ): Promise<AdmissionApplication> {
    const item = await this.admissionModel.findOne({
      _id: new Types.ObjectId(id),
      school: new Types.ObjectId(schoolId),
    }).exec();

    if (!item) {
      throw new NotFoundException('Admission application not found');
    }

    if (item.status !== AdmissionStage.VERIFICATION) {
      throw new BadRequestException('Interview scheduling requires application to be in Verification stage');
    }

    const panelMembersMapped = (dto.panelMembers || []).map(m => new Types.ObjectId(m));

    item.interviewDetails = {
      scheduledDate: new Date(dto.scheduledDate),
      scheduledTime: dto.scheduledTime,
      interviewMode: dto.interviewMode,
      panelMembers: panelMembersMapped,
    };

    item.status = AdmissionStage.INTERVIEW;
    const saved = await item.save();

    await this.auditLogsService.create({
      action: AuditAction.UPDATE,
      entityType: 'AdmissionApplication',
      entityId: saved._id.toString(),
      performedBy: userId,
      status: AuditStatus.SUCCESS,
      changes: { status: AdmissionStage.INTERVIEW, interviewDetails: dto },
    });

    // Notify applicant parent
    await this.notificationService.create({
      recipientId: userId,
      eventType: NotificationEventType.ANNOUNCEMENT,
      channel: NotificationChannel.EMAIL,
      recipientEmail: item.parentInfo.email,
      recipientPhone: item.parentInfo.phone,
      subject: 'Interview Scheduled - Admissions Office',
      message: `Dear Parent, an interview is scheduled for your child ${item.studentInfo.firstName} on ${dto.scheduledDate} at ${dto.scheduledTime} (${dto.interviewMode}).`,
      templateData: { applicantName: item.studentInfo.firstName },
    });

    return saved;
  }

  async evaluate(
    id: string,
    schoolId: string,
    userId: string,
    dto: EvaluateApplicationDto,
  ): Promise<AdmissionApplication> {
    const item = await this.admissionModel.findOne({
      _id: new Types.ObjectId(id),
      school: new Types.ObjectId(schoolId),
    }).exec();

    if (!item) {
      throw new NotFoundException('Admission application not found');
    }

    if (item.status !== AdmissionStage.INTERVIEW) {
      throw new BadRequestException('Evaluation requires application to be in Interview stage');
    }

    const total = dto.documentScore + dto.interviewScore + dto.entranceScore;

    item.scoring = {
      documentScore: dto.documentScore,
      interviewScore: dto.interviewScore,
      entranceScore: dto.entranceScore,
      totalScore: total,
      evaluationRemarks: dto.evaluationRemarks,
    };

    item.status = AdmissionStage.EVALUATION;
    const saved = await item.save();

    await this.auditLogsService.create({
      action: AuditAction.UPDATE,
      entityType: 'AdmissionApplication',
      entityId: saved._id.toString(),
      performedBy: userId,
      status: AuditStatus.SUCCESS,
      changes: { status: AdmissionStage.EVALUATION, scoring: item.scoring },
    });

    return saved;
  }

  async enroll(id: string, schoolId: string, userId: string): Promise<AdmissionApplication> {
    const application = await this.admissionModel.findOne({
      _id: new Types.ObjectId(id),
      school: new Types.ObjectId(schoolId),
    }).exec();

    if (!application) {
      throw new NotFoundException('Admission application not found');
    }

    if (application.status !== AdmissionStage.APPROVAL && application.status !== AdmissionStage.EVALUATION) {
      throw new BadRequestException('Enrollment requires application to be Approved or Evaluated first');
    }

    if (application.createdStudentId) {
      throw new BadRequestException('This application has already been enrolled');
    }

    // Determine target class
    const ClassModel = this.userModel.db.model('Class');
    let targetClass = await ClassModel.findOne({ name: { $regex: new RegExp(`^${application.gradeLevel}$`, 'i') } }).exec();
    if (!targetClass) {
      targetClass = await ClassModel.findOne().exec();
    }
    if (!targetClass) {
      throw new BadRequestException('No school classes found in database to map candidate gradeLevel');
    }

    // Determine active academic year
    const AcademicYearModel = this.userModel.db.model('AcademicYear');
    const activeYear = await AcademicYearModel.findOne({ isActive: true }).exec();
    if (!activeYear) {
      throw new BadRequestException('No active Academic Year found for invoicing enrollment fees');
    }

    // Check parent email registration
    let parentUser: any = await this.userModel.findOne({ email: application.parentInfo.email.toLowerCase() }).exec();
    const defaultPassword = process.env.DEFAULT_PASSWORD || 'Welcome123!';

    if (!parentUser) {
      parentUser = await this.parentsService.create({
        email: application.parentInfo.email.toLowerCase(),
        password: defaultPassword,
        firstName: application.parentInfo.firstName,
        lastName: application.parentInfo.lastName,
        phone: application.parentInfo.phone,
        relationshipType: application.parentInfo.relationship,
        occupation: application.parentInfo.occupation,
        address: application.studentInfo.address,
        children: [],
      });
    }

    // Create student record
    const studentUser = await this.studentsService.create({
      email: `${application.studentInfo.firstName.toLowerCase()}.${application.studentInfo.lastName.toLowerCase()}${Date.now().toString().slice(-4)}@school.com`,
      firstName: application.studentInfo.firstName,
      lastName: application.studentInfo.lastName,
      dob: application.studentInfo.dob,
      gender: application.studentInfo.gender,
      bloodGroup: application.studentInfo.bloodGroup,
      address: application.studentInfo.address,
      class: targetClass._id,
      parentId: parentUser._id,
      schoolId: new Types.ObjectId(schoolId),
    });

    // Link parent and student
    await this.userModel.findByIdAndUpdate(parentUser._id, {
      $addToSet: { children: studentUser._id },
    }).exec();

    // Create Enrollment Fee Invoice
    const invoice = await this.invoiceService.create({
      studentId: studentUser._id.toString(),
      classId: targetClass._id.toString(),
      academicYearId: activeYear._id.toString(),
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days due
      feeItems: [
        {
          name: 'Enrollment Fee',
          amount: 250,
          description: `Enrollment fee structure invoice for ${application.gradeLevel}`,
        },
      ],
      totalAmount: 250,
      netAmount: 250,
      issuedBy: 'System Auto-Enrollment',
    });

    // Update application details
    application.createdStudentId = studentUser._id;
    application.createdParentId = parentUser._id;
    application.createdInvoiceId = invoice._id;
    application.status = AdmissionStage.ENROLLMENT;

    const saved = await application.save();

    await this.auditLogsService.create({
      action: AuditAction.CREATE,
      entityType: 'User',
      entityId: studentUser._id.toString(),
      performedBy: userId,
      status: AuditStatus.SUCCESS,
      changes: { message: 'Auto created student from admissions pipeline' },
    });

    // Dispatch welcome notification containing student roll details and credentials info
    await this.notificationService.create({
      recipientId: parentUser._id.toString(),
      eventType: NotificationEventType.ANNOUNCEMENT,
      channel: NotificationChannel.EMAIL,
      recipientEmail: parentUser.email,
      recipientPhone: parentUser.phone || application.parentInfo.phone,
      subject: 'Welcome to School - Student Enrolled',
      message: `Welcome! Your child ${studentUser.firstName} has been successfully enrolled into class ${targetClass.name}. Parent login: ${parentUser.email} / Default Password: ${defaultPassword}`,
      templateData: { admissionNumber: (studentUser as any).admissionNumber },
    });

    return saved;
  }

  async getAnalytics(schoolId: string): Promise<any> {
    const match = { school: new Types.ObjectId(schoolId) };
    const allApplications = await this.admissionModel.find(match).exec();

    const byStatus: Record<string, number> = {
      Submitted: 0,
      Verification: 0,
      Interview: 0,
      Evaluation: 0,
      Approval: 0,
      Rejection: 0,
      Enrollment: 0,
    };

    const normalizeStatus = (status: string): string => {
      const map: Record<string, string> = {
        'Applied': 'Submitted',
        'Verified': 'Verification',
        'Interview Scheduled': 'Interview',
        'Under Review': 'Evaluation',
        'Approved': 'Approval',
        'Deferred': 'Approval',
        'Rejected': 'Rejection',
      };
      return map[status] || status;
    };

    allApplications.forEach(app => {
      const normalized = normalizeStatus(app.status);
      if (byStatus[normalized] !== undefined) {
        byStatus[normalized]++;
      }
    });

    const total = allApplications.length;

    const interviewProgress = total > 0 ? Math.round(((byStatus.Interview + byStatus.Evaluation + byStatus.Approval + byStatus.Enrollment) / total) * 100) : 0;
    const approvalProgress = total > 0 ? Math.round(((byStatus.Approval + byStatus.Enrollment) / total) * 100) : 0;
    const enrollmentProgress = total > 0 ? Math.round((byStatus.Enrollment / total) * 100) : 0;

    return {
      totalApplications: total,
      byStatus,
      conversionRates: {
        interviewRate: interviewProgress,
        approvalRate: approvalProgress,
        enrollmentRate: enrollmentProgress,
      },
    };
  }

  async getReport(schoolId: string, query: any): Promise<any[]> {
    const filter: any = { school: new Types.ObjectId(schoolId) };
    if (query.status) {
      filter.status = query.status;
    }
    if (query.gradeLevel) {
      filter.gradeLevel = query.gradeLevel;
    }

    const data = await this.admissionModel.find(filter).sort({ createdAt: -1 }).exec();

    return data.map(app => {
      const studentName = app.studentInfo
        ? `${app.studentInfo.firstName} ${app.studentInfo.lastName}`
        : (app as any).applicantName || 'N/A';

      const parentName = app.parentInfo
        ? `${app.parentInfo.firstName} ${app.parentInfo.lastName}`
        : 'N/A';

      const parentEmail = app.parentInfo
        ? app.parentInfo.email
        : (app as any).parentEmail || 'N/A';

      const parentPhone = app.parentInfo
        ? app.parentInfo.phone
        : 'N/A';

      return {
        applicationId: app._id.toString(),
        studentName,
        gradeLevel: app.gradeLevel,
        parentName,
        parentEmail,
        parentPhone,
        status: app.status,
        totalScore: app.scoring?.totalScore || (app as any).entranceScore || 0,
        interviewDate: app.interviewDetails?.scheduledDate || null,
        enrolledStudentId: app.createdStudentId?.toString() || null,
        createdAt: (app as any).createdAt,
      };
    });
  }

  async remove(id: string, schoolId: string): Promise<void> {
    const result = await this.admissionModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), school: new Types.ObjectId(schoolId) })
      .exec();
    if (!result) {
      throw new NotFoundException('Admission application not found');
    }
  }
}
