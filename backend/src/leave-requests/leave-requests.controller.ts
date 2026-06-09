import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeaveRequestsService } from './leave-requests.service';
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestStatusDto,
  AllocateLeaveBalanceDto,
} from './dto/leave-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Leave Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Get('balances')
  @Roles(
    RoleEnum.STUDENT,
    RoleEnum.TEACHER,
    RoleEnum.STAFF,
    RoleEnum.ADMIN,
    RoleEnum.SUPER_ADMIN,
  )
  @ApiOperation({ summary: 'Get leave balances for the authenticated user' })
  async getBalances(@CurrentUser() user: any) {
    const schoolId = user.schoolId?.toString() || user.school?.toString() || '';
    return this.leaveRequestsService.getBalances(user._id.toString(), schoolId);
  }

  @Post('balances/allocate')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Allocate leave balance to a user (Admin/Super Admin only)',
  })
  async allocateBalance(
    @CurrentUser() user: any,
    @Body() dto: AllocateLeaveBalanceDto,
  ) {
    const schoolId = user.schoolId?.toString() || user.school?.toString() || '';
    return this.leaveRequestsService.allocateBalance(schoolId, dto);
  }

  @Get('analytics/summary')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF)
  @ApiOperation({ summary: 'Get analytical summary of leave requests' })
  async getAnalytics(@CurrentUser() user: any) {
    const schoolId = user.schoolId?.toString() || user.school?.toString() || '';
    return this.leaveRequestsService.getAnalytics(schoolId);
  }

  @Post()
  @Roles(RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF)
  @ApiOperation({ summary: 'Submit a new leave request' })
  async create(@CurrentUser() user: any, @Body() dto: CreateLeaveRequestDto) {
    const schoolId = user.schoolId?.toString() || user.school?.toString() || '';
    return this.leaveRequestsService.create(
      user._id.toString(),
      schoolId,
      user.roleType,
      dto,
    );
  }

  @Get()
  @Roles(
    RoleEnum.ADMIN,
    RoleEnum.SUPER_ADMIN,
    RoleEnum.TEACHER,
    RoleEnum.STAFF,
    RoleEnum.STUDENT,
  )
  @ApiOperation({ summary: 'List leave requests' })
  async findAll(@CurrentUser() user: any, @Query() query: any) {
    const schoolId = user.schoolId?.toString() || user.school?.toString() || '';
    const filterQuery = { ...query };
    // Regular students/teachers can only see their own requests unless they are Admin/Staff
    if (user.roleType === 'STUDENT' || user.roleType === 'TEACHER') {
      filterQuery.requesterId = user._id.toString();
    }
    return this.leaveRequestsService.findAll(schoolId, filterQuery);
  }

  @Get(':id')
  @Roles(
    RoleEnum.ADMIN,
    RoleEnum.SUPER_ADMIN,
    RoleEnum.TEACHER,
    RoleEnum.STAFF,
    RoleEnum.STUDENT,
  )
  @ApiOperation({ summary: 'Get details of a leave request' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    const schoolId = user.schoolId?.toString() || user.school?.toString() || '';
    return this.leaveRequestsService.findOne(id, schoolId);
  }

  @Patch(':id/status')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER)
  @ApiOperation({ summary: 'Approve or reject a leave request step' })
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveRequestStatusDto,
  ) {
    const schoolId = user.schoolId?.toString() || user.school?.toString() || '';
    return this.leaveRequestsService.updateStatus(
      id,
      schoolId,
      user._id.toString(),
      dto,
    );
  }

  @Post(':id/cancel')
  @Roles(RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF)
  @ApiOperation({ summary: 'Cancel an approved or pending leave request' })
  async cancel(@CurrentUser() user: any, @Param('id') id: string) {
    const schoolId = user.schoolId?.toString() || user.school?.toString() || '';
    return this.leaveRequestsService.cancel(id, schoolId, user._id.toString());
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({
    summary:
      'Delete a leave request and revert balances/attendance (Admin/Super Admin only)',
  })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    const schoolId = user.schoolId?.toString() || user.school?.toString() || '';
    return this.leaveRequestsService.remove(id, schoolId);
  }
}
