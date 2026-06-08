/* eslint-disable @typescript-eslint/require-await */
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
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
import { StudentsModule } from './students/students.module';
import { TimetablesModule } from './timetables/timetables.module';
import { AttendancesModule } from './attendances/attendance.module';
import { ExaminationsModule } from './examinations/examinations.module';
import { MarksModule } from './marks/marks.module';
import { FeesModule } from './fees/fees.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ParentsModule } from './parents/parents.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { AdmissionsModule } from './admissions/admissions.module';
import { AssignmentsModule } from './assignments/assignments.module';

import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { ReportsModule } from './reports/reports.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { TenantModule } from './tenant/tenant.module';
import { TenantGuard } from './tenant/tenant.guard';
import { TenantMiddleware } from './tenant/tenant.middleware';
import { TenantInterceptor } from './tenant/tenant.interceptor';
import { tenantPlugin } from './common/database/tenant.plugin';

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
        connectionFactory: (connection) => {
          // Register dynamic query isolation plugin globally
          connection.plugin(tenantPlugin);
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    TenantModule,
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
    StudentsModule,
    ParentsModule,
    TimetablesModule,
    AttendancesModule,
    FeesModule,
    NotificationsModule,
    AnalyticsModule,
    ReportsModule,
    AuditLogsModule,
    DashboardModule,
    LeaveRequestsModule,
    AdmissionsModule,
    AssignmentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}
