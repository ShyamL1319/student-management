import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from '../services/settings.service';
import { UpdateSettingsDto } from '../dto/settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';
import { Public } from '../../common/decorators/public.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School, SchoolDocument } from '../../schools/schemas/school.schema';
import { TenantContext } from '../../tenant/tenant.context';

@ApiTags('Settings & Configuration')
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    @InjectModel(School.name)
    private readonly schoolModel: Model<SchoolDocument>,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve masked settings for the active school' })
  async getSettings() {
    const settings = await this.settingsService.getSettings();
    return this.settingsService.maskSettings(settings);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update settings for the active school' })
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    const updated = await this.settingsService.updateSettings(dto);
    return this.settingsService.maskSettings(updated);
  }

  @Get('public')
  @Public()
  @ApiOperation({
    summary: 'Retrieve public branding and basic settings (unauthenticated)',
  })
  async getPublicSettings() {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      return {
        schoolName: 'School Management System',
        branding: {
          primaryColor: '#4F46E5',
          secondaryColor: '#06B6D4',
          themeMode: 'light',
        },
        mfaEnabled: false,
      };
    }

    const [settings, school] = await Promise.all([
      this.settingsService.getSettings(),
      this.schoolModel.findById(schoolId).exec(),
    ]);

    return {
      schoolName: school?.name || 'School Management System',
      branding: {
        logoUrl: settings.branding?.logoUrl || '',
        faviconUrl: settings.branding?.faviconUrl || '',
        primaryColor: settings.branding?.primaryColor || '#4F46E5',
        secondaryColor: settings.branding?.secondaryColor || '#06B6D4',
        themeMode: settings.branding?.themeMode || 'light',
      },
      mfaEnabled: settings.mfa?.enabled || false,
    };
  }
}
