import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';
import { Message, MessageSchema } from './schemas/message.schema';
import { UsersModule } from '../users/users.module';
import { StudentsModule } from '../students/students.module';
import { AttendancesModule } from '../attendances/attendance.module';
import { MarksModule } from '../marks/marks.module';
import { FeesModule } from '../fees/fees.module';
import { ExaminationsModule } from '../examinations/examinations.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    UsersModule,
    StudentsModule,
    AttendancesModule,
    MarksModule,
    FeesModule,
    ExaminationsModule,
    NotificationsModule,
    RolesModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [ParentsController],
  providers: [ParentsService],
  exports: [ParentsService],
})
export class ParentsModule {}
