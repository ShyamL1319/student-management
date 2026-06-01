import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
  ],
  controllers: [AttendancesController],
  providers: [AttendancesService],
  exports: [AttendancesService],
})
export class AttendancesModule {}
