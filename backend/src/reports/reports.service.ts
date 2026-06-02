/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit-table';
import { Student, StudentDocument } from '../students/schemas/student.schema';
import { Teacher, TeacherDocument } from '../teachers/schemas/teacher.schema';
import {
  Attendance,
  AttendanceDocument,
} from '../attendances/schemas/attendance.schema';
import { Exam, ExamDocument } from '../examinations/schemas/exam.schema';
import { Mark, MarkDocument } from '../marks/schemas/mark.schema';
import { FeesReportService } from '../fees/fees-report.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    @InjectModel(Mark.name) private markModel: Model<MarkDocument>,
    private feesReportService: FeesReportService,
  ) {}

  async exportStudentReport(format: 'pdf' | 'excel', filters: any) {
    const query: any = {};
    if (filters.school) query.school = new Types.ObjectId(filters.school);
    if (filters.class) query.class = new Types.ObjectId(filters.class);

    const students = await this.studentModel.find(query)
      .populate('user', 'firstName lastName email')
      .populate('class', 'name')
      .lean();

    const data = students.map((s: any) => ({
      'Roll Number': s.rollNumber,
      'First Name': s.user?.firstName || '',
      'Last Name': s.user?.lastName || '',
      'Email': s.user?.email || '',
      'Class': s.class?.name || '',
      'Gender': s.gender,
      'Status': s.status,
    }));

    const columns = [
      { header: 'Roll Number', key: 'Roll Number', width: 15 },
      { header: 'First Name', key: 'First Name', width: 20 },
      { header: 'Last Name', key: 'Last Name', width: 20 },
      { header: 'Email', key: 'Email', width: 25 },
      { header: 'Class', key: 'Class', width: 15 },
      { header: 'Gender', key: 'Gender', width: 10 },
      { header: 'Status', key: 'Status', width: 10 },
    ];

    if (format === 'excel') {
      return this.convertToExcel(data, columns, 'Student Report');
    } else {
      return this.convertToPdf(data, columns.map(c => c.header), 'Student Report');
    }
  }

  async exportTeacherReport(format: 'pdf' | 'excel', filters: any) {
    const query: any = {};
    if (filters.school) query.school = new Types.ObjectId(filters.school);
    if (filters.department) query.department = new Types.ObjectId(filters.department);

    const teachers = await this.teacherModel.find(query)
      .populate('user', 'firstName lastName email')
      .populate('department', 'name')
      .lean();

    const data = teachers.map((t: any) => ({
      'Teacher ID': t.teacherId,
      'First Name': t.user?.firstName || '',
      'Last Name': t.user?.lastName || '',
      'Email': t.user?.email || '',
      'Department': t.department?.name || '',
      'Designation': t.designation,
      'Status': t.status,
    }));

    const columns = [
      { header: 'Teacher ID', key: 'Teacher ID', width: 15 },
      { header: 'First Name', key: 'First Name', width: 20 },
      { header: 'Last Name', key: 'Last Name', width: 20 },
      { header: 'Email', key: 'Email', width: 25 },
      { header: 'Department', key: 'Department', width: 20 },
      { header: 'Designation', key: 'Designation', width: 15 },
      { header: 'Status', key: 'Status', width: 10 },
    ];

    if (format === 'excel') {
      return this.convertToExcel(data, columns, 'Teacher Report');
    } else {
      return this.convertToPdf(data, columns.map(c => c.header), 'Teacher Report');
    }
  }

  async exportAttendanceReport(format: 'pdf' | 'excel', filters: any) {
    const query: any = {};
    if (filters.school) query.school = new Types.ObjectId(filters.school);
    if (filters.class) query.class = new Types.ObjectId(filters.class);
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    const attendances = await this.attendanceModel.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .populate('class', 'name')
      .lean();

    const data = attendances.map((a: any) => ({
      'Date': new Date(a.date).toLocaleDateString(),
      'Student': `${a.student?.user?.firstName} ${a.student?.user?.lastName}`,
      'Class': a.class?.name || '',
      'Status': a.status,
      'Remarks': a.remarks || '',
    }));

    const columns = [
      { header: 'Date', key: 'Date', width: 15 },
      { header: 'Student', key: 'Student', width: 30 },
      { header: 'Class', key: 'Class', width: 15 },
      { header: 'Status', key: 'Status', width: 12 },
      { header: 'Remarks', key: 'Remarks', width: 25 },
    ];

    if (format === 'excel') {
      return this.convertToExcel(data, columns, 'Attendance Report');
    } else {
      return this.convertToPdf(data, columns.map(c => c.header), 'Attendance Report');
    }
  }

  async exportExamReport(format: 'pdf' | 'excel', filters: any) {
    const query: any = {};
    if (filters.school) query.school = new Types.ObjectId(filters.school);
    if (filters.exam) query.exam = new Types.ObjectId(filters.exam);

    const marks = await this.markModel.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .populate('exam', 'title')
      .populate('subject', 'name')
      .lean();

    const data = marks.map((m: any) => ({
      'Student': `${m.student?.user?.firstName} ${m.student?.user?.lastName}`,
      'Exam': m.exam?.title || '',
      'Subject': m.subject?.name || '',
      'Marks Obtained': m.marksObtained,
      'Total Marks': m.totalMarks,
      'Percentage': ((m.marksObtained / m.totalMarks) * 100).toFixed(2) + '%',
      'Grade': m.grade || '',
    }));

    const columns = [
      { header: 'Student', key: 'Student', width: 30 },
      { header: 'Exam', key: 'Exam', width: 20 },
      { header: 'Subject', key: 'Subject', width: 20 },
      { header: 'Marks Obtained', key: 'Marks Obtained', width: 15 },
      { header: 'Total Marks', key: 'Total Marks', width: 15 },
      { header: 'Percentage', key: 'Percentage', width: 12 },
      { header: 'Grade', key: 'Grade', width: 10 },
    ];

    if (format === 'excel') {
      return this.convertToExcel(data, columns, 'Exam Report');
    } else {
      return this.convertToPdf(data, columns.map(c => c.header), 'Exam Report');
    }
  }

  async exportFeeReport(format: 'pdf' | 'excel', filters: any) {
    // Reusing existing FeesReportService logic
    const reportData = await this.feesReportService.generateCollectionReport(
      filters.class,
      filters.academicYear,
      filters.startDate ? new Date(filters.startDate) : undefined,
      filters.endDate ? new Date(filters.endDate) : undefined
    );

    const data = reportData.details.map((d: any) => ({
      'Student ID': d.studentId,
      'Amount Due': d.amountDue,
      'Amount Paid': d.amountPaid,
      'Balance': d.balance,
      'Status': d.status,
      'Due Date': d.dueDate ? new Date(d.dueDate).toLocaleDateString() : '',
    }));

    const columns = [
      { header: 'Student ID', key: 'Student ID', width: 25 },
      { header: 'Amount Due', key: 'Amount Due', width: 15 },
      { header: 'Amount Paid', key: 'Amount Paid', width: 15 },
      { header: 'Balance', key: 'Balance', width: 15 },
      { header: 'Status', key: 'Status', width: 12 },
      { header: 'Due Date', key: 'Due Date', width: 15 },
    ];

    if (format === 'excel') {
      return this.convertToExcel(data, columns, 'Fee Report');
    } else {
      return this.convertToPdf(data, columns.map(c => c.header), 'Fee Report');
    }
  }

  private async convertToExcel(data: any[], columns: any[], title: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    worksheet.columns = columns;
    worksheet.addRows(data);

    // Styling
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private convertToPdf(data: any[], headers: string[], title: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        // Title
        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();

        // Table
        const table = {
          title: '',
          headers: headers,
          rows: data.map((obj) =>
            Object.values(obj).map((val) => {
              if (val === null || val === undefined) return '';
              if (typeof val === 'object') {
                return JSON.stringify(val);
              }
              return String(val);
            }),
          ),
        };

        doc.table(table, {
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
          prepareRow: () => doc.font('Helvetica').fontSize(10),
        });

        doc.end();
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }
}
