import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto, UpdateAdmissionStatusDto } from './dto/admission.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Admissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.STAFF)
  @ApiOperation({ summary: 'Create a new admission application' })
  async create(@CurrentUser() user: any, @Body() dto: CreateAdmissionDto) {
    return this.admissionsService.create(user.school.toString(), dto);
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.STAFF)
  @ApiOperation({ summary: 'List all admission applications' })
  async findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.admissionsService.findAll(user.school.toString(), query);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.STAFF)
  @ApiOperation({ summary: 'Get details of an admission application' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.admissionsService.findOne(id, user.school.toString());
  }

  @Patch(':id/status')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.STAFF)
  @ApiOperation({ summary: 'Update status of an admission application' })
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAdmissionStatusDto,
  ) {
    return this.admissionsService.updateStatus(id, user.school.toString(), dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete an admission application' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.admissionsService.remove(id, user.school.toString());
  }
}
