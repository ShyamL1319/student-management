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
  Logger,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from './dto/notification-template.dto';
import { NotificationTemplateService } from './services/notification-template.service';

@ApiTags('Notification Templates')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('notification-templates')
export class NotificationTemplateController {
  private readonly logger = new Logger(NotificationTemplateController.name);

  constructor(private readonly templateService: NotificationTemplateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create notification template' })
  async create(@Body() createTemplateDto: CreateNotificationTemplateDto) {
    this.logger.log('Creating template');
    return this.templateService.create(createTemplateDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all notification templates' })
  async findAll(
    @Query('eventType') eventType?: string,
    @Query('channel') channel?: string,
  ) {
    this.logger.log('Fetching templates');
    return this.templateService.findAll({ eventType, channel });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get template by ID' })
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching template: ${id}`);
    return this.templateService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update template' })
  async update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateNotificationTemplateDto,
  ) {
    this.logger.log(`Updating template: ${id}`);
    return this.templateService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete template' })
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting template: ${id}`);
    return this.templateService.remove(id);
  }
}
