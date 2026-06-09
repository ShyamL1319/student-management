import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';
import { AdmissionApplication, AdmissionApplicationSchema } from './schemas/admission.schema';
import { StudentsModule } from '../students/students.module';
import { ParentsModule } from '../parents/parents.module';
import { RolesModule } from '../roles/roles.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { FeesModule } from '../fees/fees.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AdmissionApplication.name, schema: AdmissionApplicationSchema }]),
    StudentsModule,
    ParentsModule,
    RolesModule,
    NotificationsModule,
    AuditLogsModule,
    FeesModule,
  ],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}


