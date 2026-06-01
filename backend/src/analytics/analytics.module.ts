import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

import { User, UserSchema } from '../users/schemas/user.schema';
import { School, SchoolSchema } from '../schools/schemas/school.schema';
import { Student, StudentSchema } from '../students/schemas/student.schema';
import { Teacher, TeacherSchema } from '../teachers/schemas/teacher.schema';
import { Class, ClassSchema } from '../classes/schemas/class.schema';
import {
  FeeCollection,
  FeeCollectionSchema,
} from '../fees/schemas/fee-collection.schema';
import {
  Attendance,
  AttendanceSchema,
} from '../attendances/schemas/attendance.schema';
import { Mark, MarkSchema } from '../marks/schemas/mark.schema';
import { Exam, ExamSchema } from '../examinations/schemas/exam.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: School.name, schema: SchoolSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: Class.name, schema: ClassSchema },
      { name: FeeCollection.name, schema: FeeCollectionSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Mark.name, schema: MarkSchema },
      { name: Exam.name, schema: ExamSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
