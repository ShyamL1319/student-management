import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from '../students/schemas/student.schema';
import {
  Attendance,
  AttendanceDocument,
  AttendanceType,
  AttendanceStatus,
} from '../attendances/schemas/attendance.schema';
import { Mark, MarkDocument } from '../marks/schemas/mark.schema';
import { Exam, ExamDocument } from '../examinations/schemas/exam.schema';
import {
  Timetable,
  TimetableDocument,
} from '../timetables/schemas/timetable.schema';
import { Invoice, InvoiceDocument } from '../fees/schemas/invoice.schema';
import {
  Notification,
  NotificationEventType,
} from '../notifications/schemas/notification.schema';
import { Subject, SubjectDocument } from '../subjects/schemas/subject.schema';
import {
  AcademicYear,
  AcademicYearDocument,
} from '../academic-years/schemas/academic-year.schema';
import { DayOfWeek } from '../common/enums/day-of-week.enum';
import { StudentDashboardResponseDto } from './dto/student-dashboard.dto';

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

const JS_DAY_TO_ENUM: Record<number, DayOfWeek | null> = {
  0: null,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Mark.name) private markModel: Model<MarkDocument>,
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    @InjectModel(Timetable.name)
    private timetableModel: Model<TimetableDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(AcademicYear.name)
    private academicYearModel: Model<AcademicYearDocument>,
  ) {}

  async getStudentDashboardData(user: {
    _id: Types.ObjectId | string;
  }): Promise<StudentDashboardResponseDto> {
    const userId = user._id.toString();
    const student = await this.studentModel
      .findById(userId)
      .populate('class')
      .populate('section')
      .exec();

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const studentId = student._id;
    const classId = student.class?._id ?? student.class;
    const sectionId = student.section?._id ?? student.section;

    const activeYear = await this.academicYearModel.findOne({ isActive: true });
    const academicYearId = activeYear?._id;

    const [
      attendanceRecords,
      marks,
      exams,
      timetableEntries,
      invoices,
      notifications,
      subjects,
    ] = await Promise.all([
      this.attendanceModel
        .find({
          attendeeType: AttendanceType.STUDENT,
          $or: [{ attendeeId: studentId }, { student: studentId }],
        })
        .lean(),
      this.markModel.find({ studentId: userId }).lean(),
      this.examModel
        .find({
          isPublished: true,
          ...(classId ? { class: classId } : {}),
          ...(sectionId ? { section: sectionId } : {}),
        })
        .lean(),
      this.getTodayTimetable(classId, sectionId, academicYearId),
      this.invoiceModel.find({ studentId }).lean(),
      this.notificationModel
        .find({ recipientId: studentId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      this.subjectModel.find({ isActive: true }).lean(),
    ]);

    const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s.name]));

    const presentCount = attendanceRecords.filter(
      (r) => r.status === AttendanceStatus.PRESENT,
    ).length;
    const attendancePct =
      attendanceRecords.length > 0
        ? Math.round((presentCount / attendanceRecords.length) * 100)
        : 0;

    const gpa = this.calculateOverallGpa(marks);
    const subjectScores = this.buildSubjectScores(marks, subjectMap);
    const upcomingExams = this.buildUpcomingExams(exams, subjectMap);
    const assignments = this.buildAssignments(marks, subjectMap, upcomingExams);
    const schedule = this.mapSchedule(timetableEntries);
    const attendance = this.buildSubjectAttendance(
      timetableEntries,
      attendanceRecords,
      subjectMap,
    );
    const fees = this.buildFeesSummary(invoices);
    const announcements = this.buildAnnouncements(notifications);
    const achievements = this.buildAchievements(
      attendancePct,
      marks,
      subjectMap,
    );
    const communications = this.buildCommunications(notifications);
    const gpaGrowth = this.buildGpaGrowth(marks);
    const rank = await this.calculateClassRank(userId, classId);

    const className = (student.class as { name?: string })?.name ?? 'N/A';
    const sectionName = (student.section as { name?: string })?.name ?? '';
    const classLabel = sectionName ? `${className}-${sectionName}` : className;

    const pendingAssignments = assignments.filter(
      (a) => a.status === 'pending',
    ).length;
    const completedAssignments = assignments.filter(
      (a) => a.status === 'submitted' || a.status === 'graded',
    ).length;
    const unreadNotifications = notifications.filter((n) => !n.isRead).length;

    return {
      student: {
        name: `${student.firstName} ${student.lastName}`,
        id: student.admissionNumber,
        class: classLabel,
        section: className,
        rollNo: student.rollNumber,
        academicYear: activeYear?.name ?? 'N/A',
        gpa,
        attendancePct,
        completedAssignments,
        pendingAssignments,
        upcomingExams: upcomingExams.length,
        subjectsEnrolled: subjectScores.length || timetableEntries.length,
        notifications: unreadNotifications,
      },
      schedule,
      assignments,
      exams: upcomingExams,
      attendance,
      subjects: subjectScores,
      gpaGrowth,
      resources: [],
      announcements,
      fees,
      achievements,
      rank,
      communications,
    };
  }

  private async getTodayTimetable(
    classId: Types.ObjectId | undefined,
    sectionId: Types.ObjectId | undefined,
    academicYearId: Types.ObjectId | undefined,
  ) {
    if (!classId) return [];

    const todayEnum = JS_DAY_TO_ENUM[new Date().getDay()];
    if (!todayEnum) return [];

    const query: Record<string, unknown> = {
      class: classId,
      dayOfWeek: todayEnum,
      isActive: true,
    };
    if (academicYearId) query.academicYear = academicYearId;
    if (sectionId) query.section = sectionId;

    return this.timetableModel
      .find(query)
      .populate('teacher', 'firstName lastName')
      .populate('subject', 'name')
      .sort({ startTime: 1 })
      .exec();
  }

  private mapSchedule(timetableEntries: TimetableDocument[]) {
    return timetableEntries.map((entry, index) => {
      const subject = (entry.subject as { name?: string })?.name ?? 'Subject';
      const teacherDoc = entry.teacher as {
        firstName?: string;
        lastName?: string;
      } | null;
      const teacher = teacherDoc
        ? `Dr. ${teacherDoc.firstName ?? ''} ${teacherDoc.lastName ?? ''}`.trim()
        : 'Teacher';
      const color = SUBJECT_COLORS[index % SUBJECT_COLORS.length];

      return {
        id: entry._id.toString(),
        subject,
        teacher,
        time: `${entry.startTime} – ${entry.endTime}`,
        room: entry.room ?? 'TBA',
        status: this.getClassStatus(entry.startTime, entry.endTime),
        color,
      };
    });
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

  private calculateOverallGpa(marks: MarkDocument[]): number {
    if (marks.length === 0) return 0;
    const totalObtained = marks.reduce(
      (sum, m) => sum + (m.marksObtained || 0),
      0,
    );
    const totalMax = marks.reduce((sum, m) => sum + (m.maxMarks || 0), 0);
    return this.scoreToGpa(totalObtained, totalMax);
  }

  private scoreToGpa(obtained: number, max: number): number {
    if (!max) return 0;
    const pct = (obtained / max) * 100;
    if (pct >= 85) return 4.0;
    if (pct >= 70) return 3.0;
    if (pct >= 55) return 2.0;
    if (pct >= 40) return 1.0;
    return 0;
  }

  private buildSubjectScores(
    marks: MarkDocument[],
    subjectMap: Map<string, string>,
  ) {
    const bySubject = new Map<string, { obtained: number; max: number }>();

    for (const mark of marks) {
      const key = mark.subjectId;
      const existing = bySubject.get(key) ?? { obtained: 0, max: 0 };
      existing.obtained += mark.marksObtained || 0;
      existing.max += mark.maxMarks || 0;
      bySubject.set(key, existing);
    }

    return Array.from(bySubject.entries()).map(
      ([subjectId, scores], index) => ({
        name: subjectMap.get(subjectId) ?? subjectId,
        score: scores.max
          ? Math.round((scores.obtained / scores.max) * 100)
          : 0,
        color: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
      }),
    );
  }

  private buildUpcomingExams(
    exams: ExamDocument[],
    subjectMap: Map<string, string>,
  ) {
    const now = new Date();
    const items: StudentDashboardResponseDto['exams'] = [];

    for (const exam of exams) {
      for (const slot of exam.schedule ?? []) {
        const examDate = new Date(slot.date);
        if (examDate < now) continue;

        const subjectId = slot.subject?.toString();
        const countdown = Math.ceil(
          (examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        items.push({
          id: `${exam._id.toString()}-${examDate.toISOString()}`,
          subject: subjectId
            ? (subjectMap.get(subjectId) ?? exam.name)
            : exam.name,
          date: examDate.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
          }),
          time: slot.startTime ?? 'TBA',
          venue: exam.type ?? 'TBA',
          countdown: Math.max(countdown, 0),
        });
      }
    }

    return items.sort((a, b) => a.countdown - b.countdown).slice(0, 5);
  }

  private buildAssignments(
    marks: MarkDocument[],
    subjectMap: Map<string, string>,
    upcomingExams: StudentDashboardResponseDto['exams'],
  ) {
    const graded = marks.map((mark, index) => ({
      id: (mark as { _id?: Types.ObjectId })._id?.toString() ?? `mark-${index}`,
      title: `${subjectMap.get(mark.subjectId) ?? mark.subjectId} Assessment`,
      subject: subjectMap.get(mark.subjectId) ?? mark.subjectId,
      due: this.formatRelativeDate(
        (mark as { updatedAt?: Date }).updatedAt ?? new Date(),
      ),
      status: mark.grade ? ('graded' as const) : ('submitted' as const),
      priority: 'low' as const,
      grade: mark.grade,
    }));

    const pending = upcomingExams.slice(0, 3).map((exam, index) => {
      const priority: 'high' | 'medium' | 'low' =
        index === 0 ? 'high' : index === 1 ? 'medium' : 'low';
      return {
        id: `pending-${exam.id}`,
        title: `${exam.subject} Exam Preparation`,
        subject: exam.subject,
        due: exam.date,
        status: 'pending' as const,
        priority,
      };
    });

    return [...pending, ...graded];
  }

  private buildSubjectAttendance(
    timetableEntries: TimetableDocument[],
    attendanceRecords: AttendanceDocument[],
    subjectMap: Map<string, string>,
  ) {
    const subjectSlots = new Map<string, number>();
    for (const entry of timetableEntries) {
      const subject = entry.subject as
        | Types.ObjectId
        | { _id?: Types.ObjectId };
      const subjectId =
        subject instanceof Types.ObjectId
          ? subject.toString()
          : (subject?._id?.toString() ??
            (typeof subject === 'string' ? subject : ''));
      if (subjectId) {
        subjectSlots.set(subjectId, (subjectSlots.get(subjectId) ?? 0) + 1);
      }
    }

    const totalSlots = Array.from(subjectSlots.values()).reduce(
      (a, b) => a + b,
      0,
    );
    const present = attendanceRecords.filter(
      (r) => r.status === AttendanceStatus.PRESENT,
    ).length;
    const totalDays = attendanceRecords.length;

    if (subjectSlots.size === 0 && totalDays > 0) {
      return [
        {
          subject: 'Overall',
          attended: present,
          total: totalDays,
          pct: Math.round((present / totalDays) * 100),
        },
      ];
    }

    return Array.from(subjectSlots.entries()).map(([subjectId, slots]) => {
      const estimatedTotal = Math.max(
        Math.round((slots / Math.max(totalSlots, 1)) * totalDays),
        1,
      );
      const estimatedAttended = Math.round(
        (present / Math.max(totalDays, 1)) * estimatedTotal,
      );
      const pct = Math.round((estimatedAttended / estimatedTotal) * 100);
      return {
        subject: subjectMap.get(subjectId) ?? subjectId,
        attended: estimatedAttended,
        total: estimatedTotal,
        pct,
      };
    });
  }

  private buildFeesSummary(invoices: InvoiceDocument[]) {
    let paid = 0;
    let outstanding = 0;
    let nearestDue: Date | null = null;

    const history = invoices.map((invoice) => {
      paid += invoice.paidAmount || 0;
      outstanding += invoice.pendingAmount || 0;
      if (
        invoice.pendingAmount > 0 &&
        (!nearestDue || invoice.dueDate < nearestDue)
      ) {
        nearestDue = invoice.dueDate;
      }

      const firstItem = invoice.feeItems?.[0] as
        | { name?: string; feeType?: string }
        | undefined;

      const desc =
        firstItem?.name ??
        firstItem?.feeType ??
        `Invoice ${invoice.invoiceNumber}`;

      return {
        desc,
        date: new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
        }),
        amount: invoice.netAmount,
        status: (invoice.pendingAmount > 0 ? 'pending' : 'paid') as 'pending' | 'paid',
      };
    });

    return {
      paid,
      outstanding,
      dueDate: nearestDue
        ? (nearestDue as Date).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'N/A',
      history,
    };
  }

  private buildAnnouncements(notifications: Notification[]) {
    return notifications.slice(0, 6).map((n) => {
      const type = this.mapNotificationType(n.eventType);
      return {
        id: (n as { _id: Types.ObjectId })._id.toString(),
        title: n.subject,
        type,
        time: this.formatTimeAgo(
          (n as { createdAt?: Date }).createdAt ?? new Date(),
        ),
        urgent:
          n.eventType === NotificationEventType.EXAM_SCHEDULE ||
          n.eventType === NotificationEventType.FEE_ALERT,
      };
    });
  }

  private mapNotificationType(
    eventType: NotificationEventType,
  ): 'exam' | 'event' | 'notice' {
    if (eventType === NotificationEventType.EXAM_SCHEDULE) return 'exam';
    if (eventType === NotificationEventType.ANNOUNCEMENT) return 'event';
    return 'notice';
  }

  private buildAchievements(
    attendancePct: number,
    marks: MarkDocument[],
    subjectMap: Map<string, string>,
  ) {
    const achievements: StudentDashboardResponseDto['achievements'] = [];

    if (attendancePct >= 95) {
      achievements.push({
        id: 'attendance',
        title: 'Perfect Attendance',
        subtitle: new Date().toLocaleDateString('en-IN', {
          month: 'long',
          year: 'numeric',
        }),
        icon: '🏅',
      });
    }

    const topMark = [...marks].sort(
      (a, b) =>
        (b.marksObtained / Math.max(b.maxMarks, 1)) * 100 -
        (a.marksObtained / Math.max(a.maxMarks, 1)) * 100,
    )[0];

    if (topMark && topMark.marksObtained / topMark.maxMarks >= 0.85) {
      achievements.push({
        id: 'top-scorer',
        title: `Top Scorer – ${subjectMap.get(topMark.subjectId) ?? 'Subject'}`,
        subtitle: 'Latest assessment',
        icon: '🥇',
      });
    }

    if (marks.length >= 3) {
      achievements.push({
        id: 'consistent',
        title: 'Consistent Performer',
        subtitle: `${marks.length} assessments completed`,
        icon: '🔬',
      });
    }

    return achievements;
  }

  private buildCommunications(notifications: Notification[]) {
    return notifications.slice(0, 3).map((n, index) => ({
      name: n.subject.split('–')[0]?.trim() ?? 'School',
      role: this.formatEventRole(n.eventType),
      msg: n.message,
      time: this.formatTimeAgo(
        (n as { createdAt?: Date }).createdAt ?? new Date(),
      ),
      unread: n.isRead ? 0 : 1,
      color: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
    }));
  }

  private formatEventRole(eventType: NotificationEventType): string {
    const map: Record<NotificationEventType, string> = {
      [NotificationEventType.ATTENDANCE_ALERT]: 'Attendance Alert',
      [NotificationEventType.FEE_ALERT]: 'Fee Office',
      [NotificationEventType.RESULT_ALERT]: 'Results',
      [NotificationEventType.EXAM_SCHEDULE]: 'Examination Cell',
      [NotificationEventType.TIMETABLE_CHANGE]: 'Timetable',
      [NotificationEventType.ANNOUNCEMENT]: 'Announcement',
      [NotificationEventType.LEAVE_REQUESTED]: 'Leave Request',
      [NotificationEventType.LEAVE_APPROVED]: 'Leave Approval',
      [NotificationEventType.LEAVE_REJECTED]: 'Leave Rejection',
      [NotificationEventType.LEAVE_CANCELLED]: 'Leave Cancellation',
    };
    return map[eventType] ?? 'Notification';
  }

  private buildGpaGrowth(marks: MarkDocument[]) {
    const byMonth = new Map<string, { obtained: number; max: number }>();

    for (const mark of marks) {
      const date = (mark as { createdAt?: Date }).createdAt ?? new Date();
      const month = date.toLocaleDateString('en-IN', { month: 'short' });
      const existing = byMonth.get(month) ?? { obtained: 0, max: 0 };
      existing.obtained += mark.marksObtained || 0;
      existing.max += mark.maxMarks || 0;
      byMonth.set(month, existing);
    }

    const months = [
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

    const growth = months
      .filter((m) => byMonth.has(m))
      .map((month) => {
        const data = byMonth.get(month)!;
        return {
          month,
          gpa: this.scoreToGpa(data.obtained, data.max),
        };
      });

    if (growth.length === 0) {
      return [{ month: 'Current', gpa: 0 }];
    }

    return growth;
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
      .lean();
    const studentIds = classStudents.map((s) => s._id.toString());

    const allMarks = await this.markModel
      .find({ studentId: { $in: studentIds } })
      .lean();

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

  private formatRelativeDate(date: Date): string {
    const diff = Math.ceil(
      (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff > 1 && diff < 7) return `In ${diff} days`;
    if (diff < 0) {
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }

  private formatTimeAgo(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${Math.max(diffMins, 1)} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }
}
