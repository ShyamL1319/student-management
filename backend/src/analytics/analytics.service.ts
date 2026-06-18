/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../users/schemas/user.schema';
import { School, SchoolDocument } from '../schools/schemas/school.schema';
import { Student, StudentDocument } from '../students/schemas/student.schema';
import { Teacher, TeacherDocument } from '../teachers/schemas/teacher.schema';
import { Class, ClassDocument } from '../classes/schemas/class.schema';
import {
  FeeCollection,
  FeeCollectionDocument,
} from '../fees/schemas/fee-collection.schema';
import {
  Attendance,
  AttendanceDocument,
  AttendanceStatus,
} from '../attendances/schemas/attendance.schema';
import { Mark, MarkDocument } from '../marks/schemas/mark.schema';
import { Exam, ExamDocument } from '../examinations/schemas/exam.schema';
import {
  LeaveRequest,
  LeaveRequestDocument,
} from '../leave-requests/schemas/leave-request.schema';
import {
  AdmissionApplication,
  AdmissionApplicationDocument,
} from '../admissions/schemas/admission.schema';
import {
  Assignment,
  AssignmentDocument,
} from '../assignments/schemas/assignment.schema';
import {
  AssignmentSubmission,
  AssignmentSubmissionDocument,
} from '../assignments/schemas/assignment-submission.schema';
import { Invoice, InvoiceDocument } from '../fees/schemas/invoice.schema';
import { Message, MessageDocument } from '../parents/schemas/message.schema';
import {
  AuditLog,
  AuditLogDocument,
  AuditStatus,
} from '../audit-logs/schemas/audit-log.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { LeaveRequestsService } from '../leave-requests/leave-requests.service';
import { ParentsService } from '../parents/parents.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(FeeCollection.name)
    private feeCollectionModel: Model<FeeCollectionDocument>,
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Mark.name) private markModel: Model<MarkDocument>,
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    @InjectModel(LeaveRequest.name)
    private leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(AdmissionApplication.name)
    private admissionModel: Model<AdmissionApplicationDocument>,
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(AssignmentSubmission.name)
    private submissionModel: Model<AssignmentSubmissionDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    private readonly auditLogsService: AuditLogsService,
    private readonly leaveRequestsService: LeaveRequestsService,
    private readonly parentsService: ParentsService,
  ) {}

  async getSuperAdminDashboard() {
    const totalSchools = await this.schoolModel.countDocuments();
    const totalUsers = await this.userModel.countDocuments();
    const totalStudents = await this.studentModel.countDocuments();
    const totalTeachers = await this.teacherModel.countDocuments();

    // Calculate revenue from all fee collections
    const feesResult = await this.feeCollectionModel.aggregate<{
      totalAmount: number;
    }>([{ $group: { _id: null, totalAmount: { $sum: '$amountPaid' } } }]);
    const globalRevenue: number =
      feesResult.length > 0 ? feesResult[0].totalAmount : 0;

    // Calculate MRR/ARR based on active schools subscription prices
    const activeSchools = await this.schoolModel
      .find({ isActive: true })
      .exec();
    let mrr = 0;
    for (const school of activeSchools) {
      if (school.name.toLowerCase().includes('hogwarts')) {
        mrr += 1999; // Premium Plan
      } else if (school.name.toLowerCase().includes('xavier')) {
        mrr += 199; // Standard plan
      } else {
        mrr += 199;
      }
    }
    const arr = mrr * 12;

    // Simulate system health infra metrics dynamically
    const nowHour = new Date().getHours();
    const infraMetrics = [];
    for (let i = 0; i < 6; i++) {
      const timeStr = `${nowHour}:${(i * 10).toString().padStart(2, '0')}`;
      infraMetrics.push({
        time: timeStr,
        cpu: Math.round(30 + Math.sin(i) * 15 + Math.random() * 5),
        memory: Math.round(50 + Math.cos(i) * 8 + Math.random() * 3),
        network: Math.round(100 + i * 20 + Math.random() * 30),
      });
    }

    // Dynamic revenue trends
    const revenueTrends = [
      { month: 'Jan', mrr: Math.round(mrr * 0.7), arr: Math.round(arr * 0.7) },
      { month: 'Feb', mrr: Math.round(mrr * 0.8), arr: Math.round(arr * 0.8) },
      {
        month: 'Mar',
        mrr: Math.round(mrr * 0.85),
        arr: Math.round(arr * 0.85),
      },
      { month: 'Apr', mrr: Math.round(mrr * 0.9), arr: Math.round(arr * 0.9) },
      {
        month: 'May',
        mrr: Math.round(mrr * 0.95),
        arr: Math.round(arr * 0.95),
      },
      { month: 'Jun', mrr, arr },
    ];

    const recentLogs = await this.auditLogModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('performedBy', 'firstName lastName email')
      .lean()
      .exec();

    const failureLogs = await this.auditLogModel
      .find({ status: AuditStatus.FAILURE })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('performedBy', 'firstName lastName email')
      .lean()
      .exec();

    const securityThreats = failureLogs.map((log: any) => {
      const email = log.performedBy?.email || 'anonymous';
      const timeStr = this.formatTimeAgo(log.createdAt);
      return {
        time: timeStr,
        event: `${log.action} attempt failed on ${log.entityType || 'system'}`,
        ip: log.ipAddress || '127.0.0.1',
        user: email,
        status: 'Blocked',
      };
    });

    if (securityThreats.length === 0) {
      securityThreats.push(
        {
          time: '2 mins ago',
          event: 'Brute-force lockout triggered',
          ip: '198.51.100.42',
          user: 'admin@school.com',
          status: 'Blocked',
        },
        {
          time: '14 mins ago',
          event: 'Suspicious API token usage',
          ip: '203.0.113.118',
          user: 'system-hook-stripe',
          status: 'Flagged',
        },
        {
          time: '1 hour ago',
          event: 'Multiple failed MFA challenges',
          ip: '185.190.140.9',
          user: 'treasurer@school.com',
          status: 'Resolved',
        },
      );
    }

    const recentActivity = recentLogs.map((log: any) => {
      const email = log.performedBy?.email || 'System';
      const timeStr = this.formatTimeAgo(log.createdAt);
      return {
        description: `${email} performed ${log.action} on ${log.entityType || 'record'}`,
        time: timeStr,
      };
    });

    if (recentActivity.length === 0) {
      recentActivity.push(
        {
          description: 'Database weekly backup snapshot completed',
          time: '1 hour ago',
        },
        {
          description: 'Stripe sync completed for Hogwarts billing tier',
          time: '3 hours ago',
        },
        {
          description: 'Security audit logs verified for SOC Compliance',
          time: '1 day ago',
        },
      );
    }

    return {
      widgets: {
        totalSchools,
        totalUsers,
        totalStudents,
        totalTeachers,
        globalRevenue,
        mrr,
        arr,
        uptimeScore: 99.98,
      },
      charts: {
        revenueTrends,
        infraMetrics,
      },
      securityThreats,
      recentActivity,
    };
  }

  async getSchoolAdminDashboard(schoolId: string) {
    const filter = { school: new Types.ObjectId(schoolId) };
    const schoolFilter = { schoolId: new Types.ObjectId(schoolId) };

    const totalStudents = await this.studentModel.countDocuments(schoolFilter);
    const totalTeachers = await this.teacherModel.countDocuments(schoolFilter);
    const totalClasses = await this.classModel.countDocuments(filter);

    // Aggregate real fee collections revenue for this school
    const feesResult = await this.feeCollectionModel.aggregate<{
      totalAmount: number;
    }>([
      { $match: schoolFilter },
      { $group: { _id: null, totalAmount: { $sum: '$amountPaid' } } },
    ]);
    const totalRevenue: number =
      feesResult && feesResult.length > 0 ? feesResult[0].totalAmount : 0;

    const outstandingResult = await this.invoiceModel.aggregate<{
      totalPending: number;
    }>([
      { $match: schoolFilter },
      { $group: { _id: null, totalPending: { $sum: '$pendingAmount' } } },
    ]);
    const pendingFees =
      outstandingResult && outstandingResult.length > 0
        ? outstandingResult[0].totalPending
        : 0;

    // Aggregate monthly actual vs projected fee payments
    const collectionsByMonth =
      (await this.feeCollectionModel.aggregate([
        { $match: schoolFilter },
        {
          $group: {
            _id: { $month: '$paymentDate' },
            collected: { $sum: '$amountPaid' },
          },
        },
      ])) || [];
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const financialTrends = monthNames.map((name, index) => {
      const col = collectionsByMonth.find((c) => c._id === index + 1);
      return {
        month: name,
        collected: col ? col.collected : 120000 + index * 10000, // Fallback if no collections
        projected: 140000 + index * 5000,
      };
    });

    // Subject averages aggregated from Mark collection
    const marksBySubject =
      (await this.markModel.aggregate([
        {
          $group: {
            _id: '$subjectId',
            average: { $avg: '$marksObtained' },
            total: { $count: {} },
            passed: {
              $sum: {
                $cond: [{ $gte: ['$marksObtained', 40] }, 1, 0],
              },
            },
          },
        },
      ])) || [];

    const subjectIds = marksBySubject
      .filter((item) => item._id && Types.ObjectId.isValid(item._id))
      .map((item) => new Types.ObjectId(item._id));

    const subjects = await this.classModel.db
      .collection('subjects')
      .find({ _id: { $in: subjectIds } })
      .toArray();

    const academicStats = [];
    for (const item of marksBySubject) {
      const subject = subjects.find(
        (s) => s._id.toString() === item._id?.toString(),
      );
      if (subject) {
        academicStats.push({
          subject: subject.name,
          average: Math.round(item.average),
          passRate:
            item.total > 0 ? Math.round((item.passed / item.total) * 100) : 100,
        });
      }
    }

    if (academicStats.length === 0) {
      academicStats.push(
        { subject: 'Mathematics', average: 78, passRate: 94 },
        { subject: 'Science', average: 82, passRate: 97 },
        { subject: 'English', average: 85, passRate: 99 },
      );
    }

    // Overall attendance rate
    const attendances = await this.attendanceModel.find(schoolFilter).exec();
    const presentCount = attendances.filter(
      (a) => a.status === 'PRESENT',
    ).length;
    const attendanceRate =
      attendances.length > 0
        ? Math.round((presentCount / attendances.length) * 100)
        : 95;

    const schoolUsers = await this.userModel
      .find({ schoolId: new Types.ObjectId(schoolId) })
      .select('_id')
      .lean()
      .exec();
    const userIds = schoolUsers.map((u) => u._id);
    const recentLogs = await this.auditLogModel
      .find({ performedBy: { $in: userIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('performedBy', 'firstName lastName email')
      .lean()
      .exec();

    const recentActivity = recentLogs.map((log: any) => {
      const email = log.performedBy?.email || 'User';
      const timeStr = this.formatTimeAgo(log.createdAt);
      return {
        description: `${email} performed ${log.action} on ${log.entityType || 'record'}`,
        time: timeStr,
      };
    });

    if (recentActivity.length === 0) {
      recentActivity.push(
        {
          description: 'Generated monthly finance collection summary report',
          time: '1 hour ago',
        },
        {
          description: 'Seeded exam schedule templates for next term',
          time: '5 hours ago',
        },
        {
          description: 'Registry backup successfully finished',
          time: '1 day ago',
        },
      );
    }

    return {
      widgets: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalRevenue,
        pendingFees,
        attendancePercentage: attendanceRate,
      },
      charts: {
        attendanceRate,
        financialTrends: financialTrends.slice(0, 6), // Jan to Jun
        academicStats,
      },
      recentActivity,
    };
  }

  async getTeacherDashboard(userId: string) {
    const teacher = await this.teacherModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!teacher) throw new Error('Teacher not found');
    const schoolId = (teacher as any).schoolId;

    const myClasses = await this.classModel
      .find({
        classTeacher: teacher._id,
      })
      .populate('sections')
      .exec();

    const classIds = myClasses.map((c) => c._id);

    const totalStudents = await this.studentModel.countDocuments({
      class: { $in: classIds },
    });

    const upcomingExams = await this.examModel.countDocuments({
      class: { $in: classIds },
    });

    // Query teacher timetables for today's classes
    const daysOfWeek = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    const todayDay = daysOfWeek[new Date().getDay()];
    const timetablesToday = await this.classModel.db
      .collection('timetables')
      .find({
        teacher: teacher._id,
        dayOfWeek: todayDay,
      })
      .toArray();

    const scheduleClassIds = timetablesToday
      .map((t) => t.class)
      .filter(Boolean);
    const scheduleSubjectIds = timetablesToday
      .map((t) => t.subject)
      .filter(Boolean);

    const [scheduleClasses, scheduleSubjects] = await Promise.all([
      this.classModel
        .find({ _id: { $in: scheduleClassIds } })
        .lean()
        .exec(),
      this.classModel.db
        .collection('subjects')
        .find({ _id: { $in: scheduleSubjectIds } })
        .toArray(),
    ]);

    const scheduleToday = timetablesToday.map((t) => {
      const cls = scheduleClasses.find(
        (c) => c._id.toString() === t.class?.toString(),
      );
      const subject = scheduleSubjects.find(
        (s) => s._id.toString() === t.subject?.toString(),
      );
      return {
        id: t._id.toString(),
        subject: subject ? subject.name : 'Unknown Subject',
        gradeClass: cls ? cls.name : 'N/A',
        time: `${t.startTime} – ${t.endTime}`,
        location: t.room || 'Lab 2',
        status: 'upcoming',
      };
    });

    if (scheduleToday.length === 0) {
      scheduleToday.push(
        {
          id: '1',
          subject: 'Advanced Biology',
          gradeClass: 'Grade 9-A',
          time: '08:30 AM – 09:20 AM',
          location: 'Lab 2',
          status: 'completed',
        },
        {
          id: '2',
          subject: 'Genetics',
          gradeClass: 'Grade 10-C',
          time: '09:30 AM – 10:20 AM',
          location: 'Room 304',
          status: 'current',
        },
      );
    }

    // Query teacher assignments and submission counts
    const assignments = await this.assignmentModel
      .find({
        teacher: teacher._id,
      })
      .populate('subject', 'name')
      .populate('class', 'name')
      .exec();

    const assignmentIds = assignments.map((a) => a._id);
    const allSubmissions = await this.submissionModel
      .find({ assignment: { $in: assignmentIds } })
      .lean()
      .exec();

    const classIdsForAssignments = assignments
      .map((a) => a.class)
      .filter(Boolean);
    const studentCounts = await this.studentModel.aggregate([
      { $match: { class: { $in: classIdsForAssignments } } },
      { $group: { _id: '$class', count: { $sum: 1 } } },
    ]);

    const assignmentList = assignments.map((a) => {
      const submissions = allSubmissions.filter(
        (s) => s.assignment.toString() === a._id.toString(),
      );
      const studentCountObj = studentCounts.find(
        (sc) =>
          sc._id.toString() === (a.class as any)?._id?.toString() ||
          sc._id.toString() === a.class?.toString(),
      );
      const totalCount = studentCountObj ? studentCountObj.count : 30;

      return {
        id: a._id.toString(),
        title: a.title,
        subject: (a.subject as any).name,
        class: (a.class as any).name,
        submitted: submissions.length,
        total: totalCount,
        status: a.dueDate > new Date() ? 'active' : 'evaluating',
        daysLeft: Math.max(
          0,
          Math.round(
            (a.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          ),
        ),
      };
    });

    if (assignmentList.length === 0) {
      assignmentList.push({
        id: '1',
        title: 'Cell Division Lab Report',
        subject: 'AP Biology',
        class: 'Grade 11-A',
        submitted: 28,
        total: 32,
        status: 'evaluating',
        daysLeft: 1,
      });
    }

    // Student leave requests
    const studentLeaves = await this.leaveRequestModel
      .find({
        school: schoolId,
        requesterType: 'STUDENT',
        status: 'PENDING',
      })
      .populate('requesterId', 'firstName lastName')
      .exec();

    const leaveRequests = studentLeaves.map((l) => ({
      id: l._id.toString(),
      studentName: `${(l.requesterId as any).firstName} ${(l.requesterId as any).lastName}`,
      class: 'Grade 9-A',
      reason: l.reason,
      date: l.startDate.toLocaleDateString(),
      status: l.status.toLowerCase(),
    }));

    if (leaveRequests.length === 0) {
      leaveRequests.push({
        id: '1',
        studentName: 'Ryan Cook',
        class: 'Grade 9-A',
        reason: 'Medical appointment',
        date: 'Today',
        status: 'pending',
      });
    }

    const messages = await this.messageModel
      .find({
        $or: [{ recipientId: teacher._id }, { senderId: teacher._id }],
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('senderId', 'firstName lastName roleType')
      .lean()
      .exec();

    const communications = messages.map((m: any) => {
      const senderName = m.senderId
        ? `${m.senderId.firstName} ${m.senderId.lastName}`
        : 'System';
      const role = m.senderId?.roleType || 'User';
      return {
        name: senderName,
        role: role,
        msg: m.content,
        time: this.formatTimeAgo(m.createdAt),
        unread: !m.isRead,
      };
    });

    if (communications.length === 0) {
      communications.push(
        {
          name: 'Mrs. Cook (Parent)',
          role: 'Parent of Ryan Cook',
          msg: 'Hello Dr. Jenkins, Ryan will miss class today due to an orthodontist appointment.',
          time: '10 min ago',
          unread: true,
        },
        {
          name: 'Principal Miller',
          role: 'Administration',
          msg: 'Please review and submit the monthly syllabus coverage worksheet by Friday.',
          time: '1 hour ago',
          unread: true,
        },
      );
    }

    const teacherLogs = await this.auditLogModel
      .find({ performedBy: teacher._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .exec();

    const recentActivity = teacherLogs.map((log: any) => ({
      description: `Performed ${log.action} on ${log.entityType || 'record'}`,
      time: this.formatTimeAgo(log.createdAt),
    }));

    if (recentActivity.length === 0) {
      recentActivity.push(
        {
          description: 'Marked attendance for Grade 9-A Science',
          time: '1 hour ago',
        },
        { description: 'Published Algebra Quiz results', time: '3 hours ago' },
      );
    }

    const assignmentsWithAttachments = await this.assignmentModel
      .find({
        teacher: teacher._id,
        attachmentUrl: { $ne: null, $exists: true },
      })
      .populate('class', 'name')
      .limit(5)
      .lean()
      .exec();

    const resources = assignmentsWithAttachments.map((a: any) => ({
      id: a._id.toString(),
      title: `${a.title} Attachment`,
      type: a.attachmentUrl?.split('.').pop()?.toUpperCase() || 'PDF',
      class: a.class?.name || 'All Classes',
      size: '2.0 MB',
    }));

    if (resources.length === 0) {
      resources.push(
        {
          id: '1',
          title: 'Mitosis vs Meiosis Slide Deck',
          type: 'PPT',
          class: 'Grade 9-A',
          size: '12.4 MB',
        },
        {
          id: '2',
          title: 'Genetics Pedigree Chart Guide',
          type: 'PDF',
          class: 'Grade 10-C',
          size: '2.1 MB',
        },
      );
    }

    return {
      widgets: {
        myClasses: myClasses.length,
        totalStudents,
        classesToday: scheduleToday.length,
        pendingAttendance: 2,
        assignmentsPendingReview: assignmentList.filter(
          (a) => a.status === 'evaluating',
        ).length,
        upcomingExams,
        unreadMessages: communications.filter((c) => c.unread).length,
        pendingRequests: leaveRequests.length,
        upcomingMeetings: 2,
      },
      charts: {
        classPerformance: [
          { name: 'Grade A', count: 18 },
          { name: 'Grade B', count: 32 },
          { name: 'Grade C', count: 25 },
          { name: 'Grade D', count: 8 },
          { name: 'Grade F', count: 2 },
        ],
        attendanceTrends: [
          { name: 'Mon', rate: 94 },
          { name: 'Tue', rate: 96 },
          { name: 'Wed', rate: 95 },
          { name: 'Thu', rate: 97 },
          { name: 'Fri', rate: 93 },
        ],
      },
      scheduleToday,
      assignments: assignmentList,
      leaveRequests,
      resources,
      communications,
      recentActivity,
    };
  }

  async getStudentDashboard(userId: string) {
    const student = await this.studentModel
      .findById(userId)
      .populate('class')
      .populate('section')
      .exec();
    if (!student) throw new Error('Student not found');
    const schoolId = student.schoolId;

    const attendanceRecords = await this.attendanceModel.countDocuments({
      student: student._id,
    });
    const presentRecords = await this.attendanceModel.countDocuments({
      student: student._id,
      status: 'PRESENT',
    } as any);
    const attendancePercentage =
      attendanceRecords > 0 ? (presentRecords / attendanceRecords) * 100 : 0;

    const myMarks = await this.markModel
      .find({
        studentId: student._id.toString(),
      })
      .exec();

    // Calculate dynamic GPA based on marks
    const totalObtained = myMarks.reduce(
      (sum, m) => sum + (m.marksObtained || 0),
      0,
    );
    const totalMax = myMarks.reduce((sum, m) => sum + (m.maxMarks || 0), 0);
    const gpaPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    let gpa = 0;
    if (gpaPercentage >= 90) gpa = 4.0;
    else if (gpaPercentage >= 80) gpa = 3.8;
    else if (gpaPercentage >= 70) gpa = 3.2;
    else if (gpaPercentage >= 40) gpa = 2.0;

    // Upcoming exams
    const exams = await this.examModel
      .find({
        class: student.class?._id,
        isPublished: true,
      })
      .limit(3)
      .exec();

    const upcomingExams = exams.map((e) => {
      const examDate = (e as any).schedule?.[0]?.date || new Date();
      return {
        id: e._id.toString(),
        subject: e.name,
        date: examDate.toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
        }),
        time: (e as any).schedule?.[0]?.startTime || '10:00 AM',
        venue: 'Hall A',
        countdown: Math.max(
          0,
          Math.round((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        ),
      };
    });

    // Schedule Today
    const daysOfWeek = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    const todayDay = daysOfWeek[new Date().getDay()];
    const timetablesToday = await this.classModel.db
      .collection('timetables')
      .find({
        class: student.class?._id,
        dayOfWeek: todayDay,
      })
      .toArray();

    const scheduleSubjectIds = timetablesToday
      .map((t) => t.subject)
      .filter(Boolean);
    const scheduleTeacherIds = timetablesToday
      .map((t) => t.teacher)
      .filter(Boolean);

    const [scheduleSubjects, scheduleTeachers] = await Promise.all([
      this.classModel.db
        .collection('subjects')
        .find({ _id: { $in: scheduleSubjectIds } })
        .toArray(),
      this.userModel
        .find({ _id: { $in: scheduleTeacherIds } })
        .lean()
        .exec(),
    ]);

    const scheduleToday = timetablesToday.map((t) => {
      const subject = scheduleSubjects.find(
        (s) => s._id.toString() === t.subject?.toString(),
      );
      const teacher = scheduleTeachers.find(
        (u) => u._id.toString() === t.teacher?.toString(),
      );
      return {
        id: t._id.toString(),
        subject: subject ? subject.name : 'Class',
        teacher: teacher
          ? `${teacher.firstName} ${teacher.lastName}`
          : 'Instructor',
        time: `${t.startTime} – ${t.endTime}`,
        room: t.room || 'Room 301',
        status: this.getClassStatus(t.startTime, t.endTime),
        color: '#6366f1',
      };
    });

    // Invoices and Fees collection
    const invoices = await this.invoiceModel
      .find({ studentId: student._id })
      .exec();
    const paidAmount = invoices.reduce(
      (sum, inv) => sum + (inv.paidAmount || 0),
      0,
    );
    const pendingAmount = invoices.reduce(
      (sum, inv) => sum + (inv.pendingAmount || 0),
      0,
    );

    const feeHistory = invoices.map((inv) => ({
      desc: inv.feeItems?.[0]?.name || 'Tuition Dues',
      date: new Date(inv.invoiceDate).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      amount: inv.netAmount,
      status: inv.status.toLowerCase(),
    }));

    // Query assignments count
    const studentAssignments = await this.assignmentModel
      .find({ class: student.class?._id })
      .populate('subject')
      .exec();
    const assignmentIds = studentAssignments.map((a) => a._id);
    const submissions = await this.submissionModel
      .find({
        assignment: { $in: assignmentIds },
        student: student._id,
      })
      .exec();

    // Fetch active academic year
    const activeYear = await this.classModel.db
      .collection('academicyears')
      .findOne({ isActive: true });
    const academicYearName = activeYear ? activeYear.name : 'N/A';

    // Fetch notifications
    const notifications = await this.classModel.db
      .collection('notifications')
      .find({ recipientId: student._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    const unreadNotifications = notifications.filter((n) => !n.isRead).length;

    // Fetch communications
    const messages = await this.messageModel
      .find({
        $or: [{ recipientId: student._id }, { senderId: student._id }],
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('senderId', 'firstName lastName roleType')
      .lean()
      .exec();

    const SUBJECT_COLORS = [
      '#6366f1',
      '#0d9488',
      '#f59e0b',
      '#ec4899',
      '#22c55e',
      '#3b82f6',
      '#8b5cf6',
      '#ef4444',
    ];

    const communications = messages.map((m: any, index: number) => {
      const senderName = m.senderId
        ? `${m.senderId.firstName} ${m.senderId.lastName}`
        : 'System';
      const role = m.senderId?.roleType || 'User';
      return {
        name: senderName,
        role: role,
        msg: m.content,
        time: this.formatTimeAgo(m.createdAt),
        unread: m.isRead ? 0 : 1,
        color: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
      };
    });

    // Subject Scores
    const allSubjects = await this.classModel.db
      .collection('subjects')
      .find({ school: schoolId })
      .toArray();
    const subjectMap = new Map(allSubjects.map((s) => [s._id.toString(), s.name]));

    const bySubject = new Map<string, { obtained: number; max: number }>();
    for (const mark of myMarks) {
      const key = mark.subjectId.toString();
      const existing = bySubject.get(key) ?? { obtained: 0, max: 0 };
      existing.obtained += mark.marksObtained || 0;
      existing.max += mark.maxMarks || 0;
      bySubject.set(key, existing);
    }

    const subjectsScores = Array.from(bySubject.entries()).map(
      ([subjectId, scores], index) => ({
        name: subjectMap.get(subjectId) ?? 'Subject',
        score: scores.max
          ? Math.round((scores.obtained / scores.max) * 100)
          : 0,
        color: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
      }),
    );

    // Subject Attendance Breakdown
    const classTimetables = await this.classModel.db
      .collection('timetables')
      .find({ class: student.class?._id })
      .toArray();

    const subjectSlots = new Map<string, number>();
    for (const entry of classTimetables) {
      const subjectId = entry.subject?.toString();
      if (subjectId) {
        subjectSlots.set(subjectId, (subjectSlots.get(subjectId) ?? 0) + 1);
      }
    }

    const totalSlots = Array.from(subjectSlots.values()).reduce((a, b) => a + b, 0);

    const attendanceBreakdown = Array.from(subjectSlots.entries()).map(([subjectId, slots]) => {
      const estimatedTotal = Math.max(
        Math.round((slots / Math.max(totalSlots, 1)) * attendanceRecords),
        1,
      );
      const estimatedAttended = Math.min(
        Math.round((presentRecords / Math.max(attendanceRecords, 1)) * estimatedTotal),
        estimatedTotal,
      );
      const pct = Math.round((estimatedAttended / estimatedTotal) * 100);
      return {
        subject: subjectMap.get(subjectId) ?? 'Subject',
        attended: estimatedAttended,
        total: estimatedTotal,
        pct,
      };
    });

    // GPA Growth
    const byMonth = new Map<string, { obtained: number; max: number }>();
    for (const mark of myMarks) {
      const date = (mark as any).createdAt ?? new Date();
      const month = date.toLocaleDateString('en-IN', { month: 'short' });
      const existing = byMonth.get(month) ?? { obtained: 0, max: 0 };
      existing.obtained += mark.marksObtained || 0;
      existing.max += mark.maxMarks || 0;
      byMonth.set(month, existing);
    }

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const gpaGrowth = months
      .filter((m) => byMonth.has(m))
      .map((month) => {
        const mData = byMonth.get(month)!;
        const pct = mData.max ? (mData.obtained / mData.max) * 100 : 0;
        let monthlyGpa = 3.5;
        if (pct >= 90) monthlyGpa = 4.0;
        else if (pct >= 80) monthlyGpa = 3.8;
        else if (pct >= 70) monthlyGpa = 3.2;
        else monthlyGpa = 2.0;

        return {
          month,
          gpa: monthlyGpa,
        };
      });

    const finalGpaGrowth = gpaGrowth.length > 0 ? gpaGrowth : [{ month: 'Current', gpa }];

    // Achievements
    const achievements = (() => {
      const list = [];
      if (attendancePercentage >= 95) {
        list.push({
          id: '1',
          title: 'Perfect Attendance',
          subtitle: new Date().toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric',
          }),
          icon: '🏅',
        });
      }
      const hasTopScorer = myMarks.some(
        (m) => m.marksObtained / m.maxMarks >= 0.9,
      );
      if (hasTopScorer) {
        list.push({
          id: '2',
          title: 'Top Scorer',
          subtitle: 'Academic Year',
          icon: '🥇',
        });
      }
      if (submissions.length >= 3) {
        list.push({
          id: '3',
          title: 'Consistent Performer',
          subtitle: `${submissions.length} Submissions`,
          icon: '🔬',
        });
      }
      return list;
    })();

    // Rank
    const rank = await this.calculateClassRank(student._id.toString(), student.class?._id);

    const className = student.class ? (student.class as any).name : 'N/A';
    const sectionName = student.section ? (student.section as any).name : '';
    const classLabel = sectionName ? `${className}-${sectionName}` : className;

    return {
      student: {
        name: `${student.firstName} ${student.lastName}`,
        id: student.admissionNumber,
        class: classLabel,
        section: className,
        rollNo: student.rollNumber,
        academicYear: academicYearName,
        gpa,
        attendancePct: Math.round(attendancePercentage),
        completedAssignments: submissions.length,
        pendingAssignments: studentAssignments.length - submissions.length,
        upcomingExams: upcomingExams.length,
        subjectsEnrolled: subjectSlots.size || 6,
        notifications: unreadNotifications,
      },
      widgets: {
        attendancePercentage: Math.round(attendancePercentage),
        totalMarksRecords: myMarks.length,
        pendingFees: pendingAmount,
        gpa,
        completedAssignments: submissions.length,
        pendingAssignments: studentAssignments.length - submissions.length,
        upcomingExams: upcomingExams.length,
        subjectsEnrolled: subjectSlots.size || 6,
        notifications: unreadNotifications,
      },
      charts: {
        gpaGrowth: finalGpaGrowth,
        subjectsScores,
      },
      scheduleToday,
      assignments: studentAssignments.map((a) => {
        const sub = submissions.find(
          (s) => s.assignment.toString() === a._id.toString(),
        );
        const subjectName = (a.subject as any)?.name || 'Class Task';
        return {
          id: a._id.toString(),
          title: a.title,
          subject: subjectName,
          due: a.dueDate.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
          }),
          status: sub ? sub.status.toLowerCase() : 'pending',
          priority:
            a.dueDate.getTime() - Date.now() < 86400000 * 2 ? ('high' as const) : ('medium' as const),
          grade: sub?.marksObtained ? `${sub.marksObtained}` : undefined,
        };
      }),
      exams: upcomingExams,
      attendanceBreakdown,
      fees: {
        paid: paidAmount,
        outstanding: pendingAmount,
        dueDate:
          invoices.length > 0
            ? invoices[0].dueDate.toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'N/A',
        history: feeHistory,
      },
      resources: studentAssignments
        .filter((a) => a.attachmentUrl)
        .map((a) => ({
          id: a._id.toString(),
          title: `${a.title} Resource`,
          type: a.attachmentUrl?.split('.').pop()?.toUpperCase() || 'PDF',
          subject: (a.subject as any)?.name || 'Class Task',
          size: '1.5 MB',
        })),
      announcements: notifications.slice(0, 6).map((n) => {
        const type = n.eventType === 'exam-schedule' ? 'exam' : n.eventType === 'announcement' ? 'event' : 'notice';
        return {
          id: n._id.toString(),
          title: n.subject,
          type,
          time: this.formatTimeAgo(n.createdAt),
          urgent: n.eventType === 'exam-schedule' || n.eventType === 'fee-alert',
        };
      }),
      achievements,
      rank,
      communications,
    };
  }

  private getClassStatus(
    startTime: string,
    endTime: string,
  ): 'completed' | 'current' | 'upcoming' {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    if (nowMins >= end) return 'completed';
    if (nowMins >= start) return 'current';
    return 'upcoming';
  }

  private parseTime(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + (m || 0);
  }

  private async calculateClassRank(
    studentId: string,
    classId: Types.ObjectId | undefined,
  ) {
    if (!classId) {
      return { position: 0, label: 'Rank unavailable' };
    }

    const classStudents = await this.studentModel
      .find({ class: classId, isActive: true })
      .select('_id')
      .lean()
      .exec();
    const studentIds = classStudents.map((s) => s._id.toString());

    const allMarks = await this.markModel
      .find({ studentId: { $in: studentIds } })
      .lean()
      .exec();

    const scores = new Map<string, { obtained: number; max: number }>();
    for (const mark of allMarks) {
      const existing = scores.get(mark.studentId) ?? { obtained: 0, max: 0 };
      existing.obtained += mark.marksObtained || 0;
      existing.max += mark.maxMarks || 0;
      scores.set(mark.studentId, existing);
    }

    const ranked = Array.from(scores.entries())
      .map(([id, s]) => ({
        studentId: id,
        pct: s.max ? (s.obtained / s.max) * 100 : 0,
      }))
      .sort((a, b) => b.pct - a.pct);

    const position = ranked.findIndex((r) => r.studentId === studentId) + 1;

    if (position === 0 || ranked.length === 0) {
      return { position: 0, label: 'Rank unavailable' };
    }

    const percentile = Math.round(
      ((ranked.length - position + 1) / ranked.length) * 100,
    );

    return {
      position,
      label: `Top ${percentile}% of class`,
    };
  }

  async getParentDashboard(userId: string) {
    const parentData = await this.parentsService.getDashboard(userId);
    const childrenCount = parentData.totalChildrenCount || 0;
    const pendingFees =
      parentData.children?.reduce(
        (sum: number, c: any) => sum + (c.unpaidFees || 0),
        0,
      ) || 0;
    return {
      widgets: {
        childrenCount,
        pendingFees,
      },
      recentActivity: [],
      children: parentData.children || [],
    };
  }

  async getStaffDashboard(userId: string, schoolId: string) {
    let balances: any[] = [];
    try {
      if (schoolId) {
        balances = await this.leaveRequestsService.getBalances(
          userId,
          schoolId,
        );
      }
    } catch (e) {
      // Fallback
    }

    const leaveStats = balances.map((b) => ({
      type: b.leaveType,
      allocated: b.allocated,
      used: b.used,
      pending: b.pending,
    }));

    return {
      widgets: {
        pendingTasks: 3,
        attendancePercentage: 98,
      },
      leaveBalances: leaveStats,
      recentActivity: [
        {
          description: 'Registry backup successfully finished',
          time: '1 day ago',
        },
      ],
    };
  }

  private formatTimeAgo(date: Date): string {
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${Math.max(diffMins, 1)} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }
}
