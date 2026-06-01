/* eslint-disable @typescript-eslint/require-await */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuthModule } from './auth/auth.module';
import { SchoolsModule } from './schools/schools.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { DepartmentsModule } from './departments/departments.module';
import { ClassesModule } from './classes/classes.module';
import { SectionsModule } from './sections/sections.module';
import { TeachersModule } from './teachers/teachers.module';
import { CoursesModule } from './courses/courses.module';
import { SubjectsModule } from './subjects/subjects.module';
import { StaffModule } from './staff/staff.module';
import { ParentsModule } from './parents/parents.module';
import { StudentsModule } from './students/students.module';
import { TimetablesModule } from './timetables/timetables.module';
import { AttendancesModule } from './attendances/attendance.module';
import { ExaminationsModule } from './examinations/examinations.module';
import { MarksModule } from './marks/marks.module';
import { FeesModule } from './fees/fees.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    CommonModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    AuthModule,
    SchoolsModule,
    AcademicYearsModule,
    DepartmentsModule,
    CoursesModule,
    SubjectsModule,
    ClassesModule,
    SectionsModule,
    ExaminationsModule,
    MarksModule,
    TeachersModule,
    StaffModule,
    ParentsModule,
    StudentsModule,
    TimetablesModule,
    AttendancesModule,
    FeesModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
