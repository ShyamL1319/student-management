import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

import { UsersModule } from '../users/users.module';
import { School, SchoolSchema } from '../schools/schemas/school.schema';
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
import { LeaveRequest, LeaveRequestSchema } from '../leave-requests/schemas/leave-request.schema';
import { AdmissionApplication, AdmissionApplicationSchema } from '../admissions/schemas/admission.schema';
import { Assignment, AssignmentSchema } from '../assignments/schemas/assignment.schema';
import { AssignmentSubmission, AssignmentSubmissionSchema } from '../assignments/schemas/assignment-submission.schema';
import { Invoice, InvoiceSchema } from '../fees/schemas/invoice.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: School.name, schema: SchoolSchema },
      { name: Class.name, schema: ClassSchema },
      { name: FeeCollection.name, schema: FeeCollectionSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Mark.name, schema: MarkSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: AdmissionApplication.name, schema: AdmissionApplicationSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: AssignmentSubmission.name, schema: AssignmentSubmissionSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
    UsersModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
