import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateNotificationPreferenceDto } from './dto/notification-preference.dto';
import { NotificationPreferenceService } from './services/notification-preference.service';

@ApiTags('Notification Preferences')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('notification-preferences')
export class NotificationPreferenceController {
  private readonly logger = new Logger(NotificationPreferenceController.name);

  constructor(
    private readonly preferenceService: NotificationPreferenceService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get notification preferences for current user' })
  async getPreferences(@CurrentUser() user: any) {
    this.logger.log(`Fetching preferences for user: ${user._id}`);
    return this.preferenceService.getOrCreate(user._id);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(
    @CurrentUser() user: any,
    @Body() updatePreferenceDto: UpdateNotificationPreferenceDto,
  ) {
    this.logger.log(`Updating preferences for user: ${user._id}`);
    return this.preferenceService.update(user._id, updatePreferenceDto);
  }

  @Patch('channel/:channel/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable notifications for a channel' })
  async enableChannel(@CurrentUser() user: any, @Param('channel') channel: string) {
    this.logger.log(`Enabling ${channel} for user: ${user._id}`);
    return this.preferenceService.enableChannel(user._id, channel);
  }

  @Patch('channel/:channel/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable notifications for a channel' })
  async disableChannel(@CurrentUser() user: any, @Param('channel') channel: string) {
    this.logger.log(`Disabling ${channel} for user: ${user._id}`);
    return this.preferenceService.disableChannel(user._id, channel);
  }

  @Patch('event/:eventType/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable notifications for an event type' })
  async enableEvent(@CurrentUser() user: any, @Param('eventType') eventType: string) {
    this.logger.log(`Enabling event ${eventType} for user: ${user._id}`);
    return this.preferenceService.enableEvent(user._id, eventType);
  }

  @Patch('event/:eventType/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable notifications for an event type' })
  async disableEvent(@CurrentUser() user: any, @Param('eventType') eventType: string) {
    this.logger.log(`Disabling event ${eventType} for user: ${user._id}`);
    return this.preferenceService.disableEvent(user._id, eventType);
  }
}
