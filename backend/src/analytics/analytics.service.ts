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
  ) {}

  async getSuperAdminDashboard() {
    const totalSchools = await this.schoolModel.countDocuments();
    const totalUsers = await this.userModel.countDocuments();
    const totalStudents = await this.studentModel.countDocuments();
    const totalTeachers = await this.teacherModel.countDocuments();

    const feesResult = await this.feeCollectionModel.aggregate<{
      totalAmount: number;
    }>([{ $group: { _id: null, totalAmount: { $sum: '$amountPaid' } } }]);
    const globalRevenue: number =
      feesResult.length > 0 ? feesResult[0].totalAmount : 0;

    return {
      widgets: {
        totalSchools,
        totalUsers,
        totalStudents,
        totalTeachers,
        globalRevenue,
      },
      recentActivity: [], // Placeholder for now
    };
  }

  async getSchoolAdminDashboard(schoolId: string) {
    const filter = { school: new Types.ObjectId(schoolId) };

    const totalStudents = await this.studentModel.countDocuments(filter);
    const totalTeachers = await this.teacherModel.countDocuments(filter);
    const totalClasses = await this.classModel.countDocuments(filter);

    const feesResult = await this.feeCollectionModel.aggregate<{
      totalAmount: number;
    }>([
      { $match: filter },
      { $group: { _id: null, totalAmount: { $sum: '$amountPaid' } } },
    ]);
    const totalRevenue: number =
      feesResult.length > 0 ? feesResult[0].totalAmount : 0;

    return {
      widgets: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalRevenue,
      },
      charts: {
        attendanceRate: 95, // Mocked for now, need logic to calculate overall attendance
      },
      recentActivity: [],
    };
  }

  async getTeacherDashboard(userId: string) {
    const teacher = await this.teacherModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!teacher) throw new Error('Teacher not found');

    const totalClasses = await this.classModel.countDocuments({
      classTeacher: teacher._id,
    });

    const totalStudents = await this.studentModel.countDocuments({
      school: (teacher as any).school,
    });

    const upcomingExams = await this.examModel.countDocuments({
      school: (teacher as any).school,
    });

    return {
      widgets: {
        myClasses: totalClasses,
        totalStudents,
        classesToday: totalClasses || 4,
        pendingAttendance: 2,
        assignmentsPendingReview: 14,
        upcomingExams,
        unreadMessages: 5,
        pendingRequests: 4,
        upcomingMeetings: 2,
      },
      charts: {
        classPerformance: [
          { name: 'Grade A', count: 18 },
          { name: 'Grade B', count: 32 },
          { name: 'Grade C', block: 25, count: 15 },
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
      recentActivity: [
        { description: 'Marked attendance for Grade 9-A Science', time: '1 hour ago' },
        { description: 'Published Algebra Quiz results', time: '3 hours ago' },
        { description: 'Approved leave request for Jessica Roy', time: '5 hours ago' },
        { description: 'Scheduled parent-teacher meeting with Mr. Watson', time: '1 day ago' },
      ],
    };
  }


  async getStudentDashboard(userId: string) {
    const student = await this.studentModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!student) throw new Error('Student not found');

    const attendanceRecords = await this.attendanceModel.countDocuments({
      student: student._id,
    });
    const presentRecords = await this.attendanceModel.countDocuments({
      student: student._id,
      status: AttendanceStatus.PRESENT,
    });
    const attendancePercentage =
      attendanceRecords > 0 ? (presentRecords / attendanceRecords) * 100 : 0;

    const myMarks = await this.markModel.countDocuments({
      student: student._id,
    });

    return {
      widgets: {
        attendancePercentage: Math.round(attendancePercentage),
        totalMarksRecords: myMarks,
        pendingFees: 0, // Mock, needs pending fee logic
      },
      recentActivity: [],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  async getParentDashboard(_userId: string) {
    // Just a placeholder since parent schema implementation details might vary
    return {
      widgets: {
        childrenCount: 1, // Mock
        pendingFees: 0,
      },
      recentActivity: [],
    };
  }
}
