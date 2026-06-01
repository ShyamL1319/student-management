import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Body,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationEventService } from './services/notification-event.service';

interface AttendanceAlertDto {
  studentId: string;
  studentEmail: string;
  studentPhone: string;
  absenceCount: number;
  attendancePercentage: number;
}

interface FeeAlertDto {
  studentId: string;
  studentEmail: string;
  studentPhone: string;
  pendingAmount: number;
  dueDate: string;
}

interface ResultAlertDto {
  studentId: string;
  studentEmail: string;
  studentPhone: string;
  examName: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
}

@ApiTags('Notification Events')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('notification-events')
export class NotificationEventController {
  private readonly logger = new Logger(NotificationEventController.name);

  constructor(private readonly eventService: NotificationEventService) {}

  @Post('attendance-alert')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Trigger attendance alert' })
  async triggerAttendanceAlert(@Body() attendanceAlertDto: AttendanceAlertDto) {
    this.logger.log(
      `Triggering attendance alert for student: ${attendanceAlertDto.studentId}`,
    );
    return this.eventService.triggerAttendanceAlert(
      attendanceAlertDto.studentId,
      attendanceAlertDto.studentEmail,
      attendanceAlertDto.studentPhone,
      {
        absenceCount: attendanceAlertDto.absenceCount,
        attendancePercentage: attendanceAlertDto.attendancePercentage,
      },
    );
  }

  @Post('fee-alert')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Trigger fee alert' })
  async triggerFeeAlert(@Body() feeAlertDto: FeeAlertDto) {
    this.logger.log(
      `Triggering fee alert for student: ${feeAlertDto.studentId}`,
    );
    return this.eventService.triggerFeeAlert(
      feeAlertDto.studentId,
      feeAlertDto.studentEmail,
      feeAlertDto.studentPhone,
      {
        pendingAmount: feeAlertDto.pendingAmount,
        dueDate: feeAlertDto.dueDate,
      },
    );
  }

  @Post('result-alert')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Trigger result alert' })
  async triggerResultAlert(@Body() resultAlertDto: ResultAlertDto) {
    this.logger.log(
      `Triggering result alert for student: ${resultAlertDto.studentId}`,
    );
    return this.eventService.triggerResultAlert(
      resultAlertDto.studentId,
      resultAlertDto.studentEmail,
      resultAlertDto.studentPhone,
      {
        examName: resultAlertDto.examName,
        totalMarks: resultAlertDto.totalMarks,
        obtainedMarks: resultAlertDto.obtainedMarks,
        percentage: resultAlertDto.percentage,
      },
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all notification events' })
  async findAll(
    @Query('eventType') eventType?: string,
    @Query('relatedEntityType') relatedEntityType?: string,
  ) {
    this.logger.log('Fetching events');
    return this.eventService.findAll({ eventType, relatedEntityType });
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get notification event statistics' })
  async getStatistics() {
    this.logger.log('Getting event statistics');
    return this.eventService.getStatistics();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get event by ID' })
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching event: ${id}`);
    return this.eventService.findOne(id);
  }
}
