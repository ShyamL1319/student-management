import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { StudentsModule } from '../students/students.module';
import { AttendancesModule } from '../attendances/attendance.module';
import { MarksModule } from '../marks/marks.module';
import { ExaminationsModule } from '../examinations/examinations.module';
import { TimetablesModule } from '../timetables/timetables.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AcademicYearsModule } from '../academic-years/academic-years.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { FeesModule } from 'src/fees/fees.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [DashboardController],
  imports: [
    StudentsModule,
    AttendancesModule,
    MarksModule,
    ExaminationsModule,
    TimetablesModule,
    FeesModule,
    NotificationsModule,
    AcademicYearsModule,
    SubjectsModule,
    CommonModule,
  ],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
