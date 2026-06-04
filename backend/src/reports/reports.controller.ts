import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum as Role } from '../common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('export')
  @Roles(Role.SUPER_ADMIN)
  async export(
    @Query('type') type: string,
    @Query('format') format: 'pdf' | 'excel',
    @Query() filters: any,
    @Res() res: Response,
  ) {
    let buffer: Buffer;
    let fileName: string;
    let contentType: string;

    switch (type) {
      case 'student':
        buffer = await this.reportsService.exportStudentReport(format, filters);
        fileName = `student_report_${Date.now()}`;
        break;
      case 'teacher':
        buffer = await this.reportsService.exportTeacherReport(format, filters);
        fileName = `teacher_report_${Date.now()}`;
        break;
      case 'attendance':
        buffer = await this.reportsService.exportAttendanceReport(
          format,
          filters,
        );
        fileName = `attendance_report_${Date.now()}`;
        break;
      case 'exam':
        buffer = await this.reportsService.exportExamReport(format, filters);
        fileName = `exam_report_${Date.now()}`;
        break;
      case 'fee':
        buffer = await this.reportsService.exportFeeReport(format, filters);
        fileName = `fee_report_${Date.now()}`;
        break;
      default:
        return res.status(400).send('Invalid report type');
    }

    if (format === 'excel') {
      contentType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileName += '.xlsx';
    } else {
      contentType = 'application/pdf';
      fileName += '.pdf';
    }

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
