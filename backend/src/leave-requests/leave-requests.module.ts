import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveRequestsController } from './leave-requests.controller';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveRequest, LeaveRequestSchema } from './schemas/leave-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LeaveRequest.name, schema: LeaveRequestSchema }]),
  ],
  controllers: [LeaveRequestsController],
  providers: [LeaveRequestsService],
  exports: [LeaveRequestsService],
})
export class LeaveRequestsModule {}
