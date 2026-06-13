import { Controller, Get, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RoleEnum } from '../common/enums/role.enum';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @SkipThrottle({ default: true, sensitive: true, exports: true })
  @Get('dashboard')
  async getDashboard(
    @CurrentUser()
    user: {
      role: RoleEnum;
      school?: { toString(): string };
      schoolId?: { toString(): string };
      _id: { toString(): string };
    },
  ) {
    switch (user.role) {
      case RoleEnum.SUPER_ADMIN:
        return this.analyticsService.getSuperAdminDashboard();
      case RoleEnum.ADMIN:
        return this.analyticsService.getSchoolAdminDashboard(
          user.schoolId?.toString() || user.school?.toString() || '',
        );
      case RoleEnum.TEACHER:
        return this.analyticsService.getTeacherDashboard(user._id.toString());
      case RoleEnum.STUDENT:
        return this.analyticsService.getStudentDashboard(user._id.toString());
      case RoleEnum.PARENT:
        return this.analyticsService.getParentDashboard(user._id.toString());
      case RoleEnum.STAFF:
        return this.analyticsService.getStaffDashboard(
          user._id.toString(),
          user.schoolId?.toString() || user.school?.toString() || '',
        );
      default:
        // Default to a simple dashboard if role is unknown
        return { widgets: {}, recentActivity: [] };
    }
  }
}
