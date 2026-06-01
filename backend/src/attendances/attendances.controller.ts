import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceReportQueryDto } from './dto/attendance-report-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create an attendance record' })
  @ApiResponse({ status: 201, description: 'Attendance created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid attendance data' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendancesService.create(createAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get attendance records with filters' })
  @ApiResponse({ status: 200, description: 'Attendance records returned' })
  findAll(@Query() query: any) {
    return this.attendancesService.findAll(query);
  }

  @Get('daily-report')
  @ApiOperation({ summary: 'Get attendance daily summary report' })
  @ApiResponse({ status: 200, description: 'Daily attendance report returned' })
  getDailyReport(@Query() query: AttendanceReportQueryDto) {
    return this.attendancesService.getDailyReport(query);
  }

  @Get('monthly-report')
  @ApiOperation({ summary: 'Get attendance monthly summary report' })
  @ApiResponse({
    status: 200,
    description: 'Monthly attendance report returned',
  })
  getMonthlyReport(@Query() query: AttendanceReportQueryDto) {
    return this.attendancesService.getMonthlyReport(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiResponse({ status: 200, description: 'Attendance record returned' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  findOne(@Param('id') id: string) {
    return this.attendancesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attendance record' })
  @ApiResponse({ status: 200, description: 'Attendance updated successfully' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendancesService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete attendance record' })
  @ApiResponse({ status: 204, description: 'Attendance deleted successfully' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  remove(@Param('id') id: string) {
    return this.attendancesService.remove(id);
  }
}
