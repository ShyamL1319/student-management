import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { UsersModule } from '../users/users.module';
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
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: Mark.name, schema: MarkSchema },
    ]),
    UsersModule,
    FeesModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
