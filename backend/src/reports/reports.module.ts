import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Student, StudentSchema } from '../students/schemas/student.schema';
import { Teacher, TeacherSchema } from '../teachers/schemas/teacher.schema';
import {
  Attendance,
  AttendanceSchema,
} from '../attendances/schemas/attendance.schema';
import { Exam, ExamSchema } from '../examinations/schemas/exam.schema';
import { Mark, MarkSchema } from '../marks/schemas/mark.schema';
import { FeesModule } from '../fees/fees.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: Mark.name, schema: MarkSchema },
    ]),
    FeesModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
