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
import { AdmissionsService } from './admissions.service';
import {
  CreateAdmissionDto,
  ScheduleInterviewDto,
  EvaluateApplicationDto,
  UpdateAdmissionStatusDto,
} from './dto/admission.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Admissions')
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Post('apply')
  @Public()
  @ApiOperation({ summary: 'Submit an online admission application' })
  async apply(
    @Body() dto: CreateAdmissionDto,
    @Query('schoolId') schoolId: string,
  ) {
    return this.admissionsService.create(schoolId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all admission applications' })
  async findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.admissionsService.findAll(user.schoolId.toString(), query);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admissions conversion funnel rates' })
  async getAnalytics(@CurrentUser() user: any) {
    return this.admissionsService.getAnalytics(user.schoolId.toString());
  }

  @Get('report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get report dataset for applications' })
  async getReport(@CurrentUser() user: any, @Query() query: any) {
    return this.admissionsService.getReport(user.schoolId.toString(), query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get details of an admission application' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.admissionsService.findOne(id, user.schoolId.toString());
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update status of an admission application' })
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAdmissionStatusDto,
  ) {
    return this.admissionsService.updateStatus(
      id,
      user.schoolId.toString(),
      user._id.toString(),
      dto,
    );
  }

  @Post(':id/schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule panel interview for candidate' })
  async scheduleInterview(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ScheduleInterviewDto,
  ) {
    return this.admissionsService.scheduleInterview(
      id,
      user.schoolId.toString(),
      user._id.toString(),
      dto,
    );
  }

  @Post(':id/evaluate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit evaluation scores for candidate' })
  async evaluate(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: EvaluateApplicationDto,
  ) {
    return this.admissionsService.evaluate(
      id,
      user.schoolId.toString(),
      user._id.toString(),
      dto,
    );
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enroll candidate, generate invoice and user credentials',
  })
  async enroll(@CurrentUser() user: any, @Param('id') id: string) {
    return this.admissionsService.enroll(
      id,
      user.schoolId.toString(),
      user._id.toString(),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an admission application' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.admissionsService.remove(id, user.schoolId.toString());
  }
}
