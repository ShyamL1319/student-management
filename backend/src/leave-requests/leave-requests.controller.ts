import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeaveRequestsService } from './leave-requests.service';
import { CreateLeaveRequestDto, UpdateLeaveRequestStatusDto } from './dto/leave-request.dto';
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

  @Post()
  @Roles(RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF)
  @ApiOperation({ summary: 'Submit a new leave request' })
  async create(@CurrentUser() user: any, @Body() dto: CreateLeaveRequestDto) {
    return this.leaveRequestsService.create(user._id.toString(), user.school.toString(), user.roleType, dto);
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.STUDENT)
  @ApiOperation({ summary: 'List leave requests' })
  async findAll(@CurrentUser() user: any, @Query() query: any) {
    // Regular students/teachers can only see their own requests unless they are Admin/Staff
    const filterQuery = { ...query };
    if (user.roleType === 'STUDENT' || user.roleType === 'TEACHER') {
      filterQuery.requesterId = user._id.toString();
    }
    return this.leaveRequestsService.findAll(user.school.toString(), filterQuery);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Get details of a leave request' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leaveRequestsService.findOne(id, user.school.toString());
  }

  @Patch(':id/status')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER)
  @ApiOperation({ summary: 'Approve or reject a leave request' })
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveRequestStatusDto,
  ) {
    return this.leaveRequestsService.updateStatus(id, user.school.toString(), user._id.toString(), dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.STUDENT, RoleEnum.TEACHER)
  @ApiOperation({ summary: 'Cancel/Delete a leave request' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leaveRequestsService.remove(id, user.school.toString());
  }
}
