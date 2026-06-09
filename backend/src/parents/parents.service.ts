import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Parent, ParentDocument } from './schemas/parent.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { Student, StudentDocument } from '../students/schemas/student.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role, RoleDocument } from '../roles/schemas/role.schema';
import {
  Attendance,
  AttendanceDocument,
  AttendanceType,
} from '../attendances/schemas/attendance.schema';
import { Mark, MarkDocument } from '../marks/schemas/mark.schema';
import { Invoice, InvoiceDocument } from '../fees/schemas/invoice.schema';
import { Exam, ExamDocument } from '../examinations/schemas/exam.schema';
import { Notification } from '../notifications/schemas/notification.schema';
import {
  RegisterParentDto,
  LinkChildDto,
  SendParentMessageDto,
  UpdateParentProfileDto,
  CreateParentDto,
  UpdateParentDto,
} from './dto/parent-auth.dto';

@Injectable()
export class ParentsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Mark.name) private markModel: Model<MarkDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async register(dto: RegisterParentDto): Promise<any> {
    const existingUser = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .setOptions({ bypassTenant: true })
      .exec();
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const parentRole = await this.roleModel.findOne({ name: 'PARENT' }).exec();
    if (!parentRole) {
      throw new NotFoundException(
        'Parent role has not been seeded in the system',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const createdParent = new this.userModel({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone || '',
      role: parentRole._id,
      roleType: 'PARENT',
      isActive: true,
      children: [],
      relationshipType: dto.relationshipType || '',
    });

    const saved = await createdParent.save();
    const { passwordHash: _, ...result } = saved.toObject();
    return result;
  }

  async linkChild(parentIdStr: string, dto: LinkChildDto): Promise<any> {
    const parent = (await this.userModel.findById(parentIdStr).exec()) as any;
    if (!parent || parent.roleType !== 'PARENT') {
      throw new NotFoundException('Parent account not found');
    }

    // Match student using admission number
    const student = await this.studentModel
      .findOne({
        admissionNumber: dto.admissionNumber,
      })
      .exec();

    if (!student) {
      throw new NotFoundException(
        `Student with admission number ${dto.admissionNumber} not found`,
      );
    }

    // Verify student DOB matches input criteria
    const inputDate = new Date(dto.dob);
    const studentDate = student.dob ? new Date(student.dob) : null;

    if (
      !studentDate ||
      inputDate.getUTCFullYear() !== studentDate.getUTCFullYear() ||
      inputDate.getUTCMonth() !== studentDate.getUTCMonth() ||
      inputDate.getUTCDate() !== studentDate.getUTCDate()
    ) {
      throw new BadRequestException(
        'Verification failed: Child birth date does not match school files',
      );
    }

    // Link student to parent
    const childrenList = parent.children || [];
    if (
      !childrenList.some(
        (childId: any) => childId.toString() === student._id.toString(),
      )
    ) {
      await this.userModel.updateOne(
        { _id: parent._id },
        { $push: { children: student._id } },
      );
    }

    // Link parent back to student
    student.parentId = parent._id as Types.ObjectId;
    await student.save();

    return { message: 'Child linked successfully', studentId: student._id };
  }

  async getChildren(parentIdStr: string): Promise<any[]> {
    const parent = (await this.userModel.findById(parentIdStr).exec()) as any;
    if (!parent) throw new NotFoundException('Parent account not found');

    const childrenIds = parent.children || [];
    return this.studentModel
      .find({
        _id: { $in: childrenIds },
      })
      .populate('class', 'name')
      .populate('section', 'name')
      .lean();
  }

  async getDashboard(parentIdStr: string): Promise<any> {
    const children = await this.getChildren(parentIdStr);

    const childrenSummaries = await Promise.all(
      children.map(async (child) => {
        const studentId = child._id.toString();
        const classId = child.class?._id;

        const [attendanceRecords, marks, invoices, exams] = await Promise.all([
          this.attendanceModel
            .find({
              attendeeType: AttendanceType.STUDENT,
              $or: [{ attendeeId: child._id }, { student: child._id }],
            })
            .lean(),
          this.markModel.find({ studentId }).lean(),
          this.invoiceModel.find({ studentId: child._id }).lean(),
          this.examModel
            .find({ isPublished: true, ...(classId ? { class: classId } : {}) })
            .lean(),
        ]);

        const presentCount = attendanceRecords.filter(
          (r) => r.status === 'PRESENT',
        ).length;
        const attendancePct =
          attendanceRecords.length > 0
            ? Math.round((presentCount / attendanceRecords.length) * 100)
            : 100;

        const unpaidFees = invoices.reduce(
          (sum, inv) => sum + (inv.pendingAmount || 0),
          0,
        );
        const outstandingInvoices = invoices.filter(
          (inv) => inv.pendingAmount > 0,
        ).length;

        const averageMarks =
          marks.length > 0
            ? Math.round(
                (marks.reduce(
                  (sum, m) => sum + m.marksObtained / m.maxMarks,
                  0,
                ) /
                  marks.length) *
                  100,
              )
            : null;

        return {
          id: studentId,
          name: `${child.firstName} ${child.lastName}`,
          admissionNumber: child.admissionNumber,
          rollNumber: child.rollNumber,
          class: child.class?.name || 'N/A',
          section: child.section?.name || '',
          attendancePct,
          unpaidFees,
          outstandingInvoices,
          averageMarks,
          upcomingExamsCount: exams.length,
        };
      }),
    );

    return {
      children: childrenSummaries,
      totalChildrenCount: childrenSummaries.length,
    };
  }

  async getChildAttendance(
    parentIdStr: string,
    studentId: string,
    options: { page?: number; limit?: number },
  ) {
    await this.verifyChildAccess(parentIdStr, studentId);

    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.attendanceModel
        .find({
          attendeeType: AttendanceType.STUDENT,
          $or: [
            { attendeeId: new Types.ObjectId(studentId) },
            { student: new Types.ObjectId(studentId) },
          ],
        })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.attendanceModel.countDocuments({
        attendeeType: AttendanceType.STUDENT,
        $or: [
          { attendeeId: new Types.ObjectId(studentId) },
          { student: new Types.ObjectId(studentId) },
        ],
      }),
    ]);

    return { data, total, page, limit };
  }

  async getChildAcademic(parentIdStr: string, studentId: string) {
    await this.verifyChildAccess(parentIdStr, studentId);

    const marks = await this.markModel.find({ studentId }).lean();
    const gpa = this.calculateGpa(marks);

    return {
      gpa,
      marks: marks.map((m) => ({
        subjectId: m.subjectId,
        examId: m.examId,
        marksObtained: m.marksObtained,
        maxMarks: m.maxMarks,
        grade: m.grade || 'N/A',
        gpa: m.gpa || 0,
      })),
    };
  }

  async getChildFees(parentIdStr: string, studentId: string) {
    await this.verifyChildAccess(parentIdStr, studentId);
    return this.invoiceModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .sort({ invoiceDate: -1 })
      .lean();
  }

  async getChildExams(parentIdStr: string, studentId: string) {
    await this.verifyChildAccess(parentIdStr, studentId);

    const student = await this.studentModel.findById(studentId).exec();
    if (!student) throw new NotFoundException('Child student record not found');

    const classId = student.class;
    return this.examModel
      .find({
        isPublished: true,
        ...(classId ? { class: classId } : {}),
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getNotifications(parentIdStr: string) {
    return this.notificationModel
      .find({
        recipientId: new Types.ObjectId(parentIdStr),
      })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
  }

  async getMessages(parentIdStr: string) {
    return this.messageModel
      .find({
        $or: [
          { senderId: new Types.ObjectId(parentIdStr) },
          { recipientId: new Types.ObjectId(parentIdStr) },
        ],
      })
      .populate('senderId', 'firstName lastName roleType')
      .populate('recipientId', 'firstName lastName roleType')
      .sort({ createdAt: -1 })
      .lean();
  }

  async sendMessage(parentIdStr: string, dto: SendParentMessageDto) {
    const recipient = await this.userModel.findById(dto.recipientId).exec();
    if (!recipient) {
      throw new NotFoundException('Recipient user not found');
    }

    if (
      recipient.roleType !== 'TEACHER' &&
      recipient.roleType !== 'STAFF' &&
      recipient.roleType !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'Parents can only message Teachers, Staff, or School Admins',
      );
    }

    const message = new this.messageModel({
      senderId: new Types.ObjectId(parentIdStr),
      recipientId: new Types.ObjectId(dto.recipientId),
      subject: dto.subject || 'Direct Message',
      content: dto.content,
      isRead: false,
    });

    return message.save();
  }

  async getProfile(parentIdStr: string) {
    const parent = await this.userModel
      .findById(parentIdStr)
      .populate('role')
      .lean();
    if (!parent) throw new NotFoundException('Parent profile not found');
    const { passwordHash: _, ...profile } = parent;
    return profile;
  }

  async updateProfile(parentIdStr: string, dto: UpdateParentProfileDto) {
    const updated = await this.userModel
      .findByIdAndUpdate(parentIdStr, { $set: dto }, { new: true })
      .populate('role')
      .exec();

    if (!updated) throw new NotFoundException('Parent profile not found');
    const { passwordHash: _, ...profile } = updated.toObject();
    return profile;
  }

  async findAll(query: any): Promise<{ data: any[]; total: number }> {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    const skip = (page - 1) * limit;
    const search = query.search || '';

    const filter: any = { roleType: 'PARENT' };
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .populate('role')
        .populate({
          path: 'children',
          model: 'User',
          select: 'firstName lastName admissionNumber',
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<any> {
    const parent = await this.userModel
      .findById(id)
      .populate('role')
      .populate({
        path: 'children',
        model: 'User',
        select: 'firstName lastName admissionNumber',
      })
      .lean();
    if (!parent || parent.roleType !== 'PARENT') {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }
    return parent;
  }

  async create(dto: CreateParentDto): Promise<any> {
    const existingUser = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .setOptions({ bypassTenant: true })
      .exec();
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const parentRole = await this.roleModel.findOne({ name: 'PARENT' }).exec();
    if (!parentRole) {
      throw new NotFoundException(
        'Parent role has not been seeded in the system',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const childrenObjectIds = (dto.children || []).map(
      (id: string) => new Types.ObjectId(id),
    );

    const createdParent = new this.userModel({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone || '',
      role: parentRole._id,
      roleType: 'PARENT',
      isActive: true,
      children: childrenObjectIds,
      relationshipType: dto.relationshipType || '',
      occupation: dto.occupation || '',
      address: dto.address || '',
    });

    const saved = await createdParent.save();

    if (childrenObjectIds.length > 0) {
      await this.studentModel.updateMany(
        { _id: { $in: childrenObjectIds } },
        { $set: { parentId: saved._id } },
      );
    }

    const { passwordHash: _, ...result } = saved.toObject();
    return result;
  }

  async update(id: string, dto: UpdateParentDto): Promise<any> {
    const parent = await this.userModel.findById(id).exec();
    if (!parent || parent.roleType !== 'PARENT') {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    const updateFields: any = { ...dto };
    delete updateFields.password;

    if (dto.children) {
      updateFields.children = dto.children.map(
        (cid: string) => new Types.ObjectId(cid),
      );
    }

    const updated = await this.userModel
      .findByIdAndUpdate(id, { $set: updateFields }, { new: true })
      .populate('role')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    if (dto.children) {
      const childrenObjectIds = dto.children.map(
        (cid: string) => new Types.ObjectId(cid),
      );
      await this.studentModel.updateMany(
        { parentId: parent._id, _id: { $nin: childrenObjectIds } },
        { $unset: { parentId: 1 } },
      );
      if (childrenObjectIds.length > 0) {
        await this.studentModel.updateMany(
          { _id: { $in: childrenObjectIds } },
          { $set: { parentId: parent._id } },
        );
      }
    }

    const { passwordHash: _, ...result } = updated.toObject();
    return result;
  }

  async remove(id: string): Promise<any> {
    const parent = await this.userModel.findById(id).exec();
    if (!parent || parent.roleType !== 'PARENT') {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    await this.studentModel.updateMany(
      { parentId: parent._id },
      { $unset: { parentId: 1 } },
    );

    await this.userModel.findByIdAndDelete(id).exec();
    return {
      success: true,
      message: `Parent with ID ${id} deleted successfully`,
    };
  }

  // Helper validation guard to prevent parents from accessing unauthorized children info
  private async verifyChildAccess(
    parentIdStr: string,
    studentId: string,
  ): Promise<void> {
    const parent = (await this.userModel.findById(parentIdStr).exec()) as any;
    if (!parent) throw new NotFoundException('Parent account not found');

    const childrenIds = parent.children || [];
    const isChildAssociated = childrenIds.some(
      (childId: any) => childId.toString() === studentId,
    );
    if (!isChildAssociated) {
      throw new ForbiddenException(
        "Access denied: You are not authorized to view this student's records",
      );
    }
  }

  private calculateGpa(marks: MarkDocument[]): number {
    if (marks.length === 0) return 0;
    const totalObtained = marks.reduce(
      (sum, m) => sum + (m.marksObtained || 0),
      0,
    );
    const totalMax = marks.reduce((sum, m) => sum + (m.maxMarks || 0), 0);
    if (!totalMax) return 0;

    const pct = (totalObtained / totalMax) * 100;
    if (pct >= 85) return 4.0;
    if (pct >= 70) return 3.0;
    if (pct >= 55) return 2.0;
    if (pct >= 40) return 1.0;
    return 0;
  }
}
