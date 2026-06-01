/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFilterDto } from './dto/notification-filter.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationService } from './services/notification.service';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create and send a notification' })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    this.logger.log('Creating notification');
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all notifications for current user' })
  async findAll(
    @CurrentUser() user: any,
    @Query() filter: NotificationFilterDto,
  ) {
    this.logger.log(`Fetching notifications for user: ${user._id}`);
    return this.notificationService.findByRecipient(user._id, filter);
  }

  @Get('unread/count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser() user: any) {
    this.logger.log(`Getting unread count for user: ${user._id}`);
    const count = await this.notificationService.getUnreadCount(user._id);
    return { unreadCount: count };
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get notification statistics' })
  async getStatistics(@CurrentUser() user: any) {
    this.logger.log(`Getting statistics for user: ${user._id}`);
    return this.notificationService.getStatistics(user._id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get notification by ID' })
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching notification: ${id}`);
    return this.notificationService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update notification' })
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    this.logger.log(`Updating notification: ${id}`);
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string) {
    this.logger.log(`Marking notification as read: ${id}`);
    return this.notificationService.markAsRead(id);
  }

  @Patch('read/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: any) {
    this.logger.log(`Marking all notifications as read for user: ${user._id}`);
    return this.notificationService.markAllAsRead(user._id);
  }

  @Post(':id/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry failed notification' })
  async retryFailed(@Param('id') id: string) {
    this.logger.log(`Retrying notification: ${id}`);
    return this.notificationService.retryFailed(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete notification' })
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting notification: ${id}`);
    return this.notificationService.remove(id);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all notifications for user' })
  async clearAll(@CurrentUser() user: any) {
    this.logger.log(`Clearing all notifications for user: ${user._id}`);
    return this.notificationService.clearAll(user._id);
  }
}
