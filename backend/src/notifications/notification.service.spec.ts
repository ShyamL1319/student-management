import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationService } from './services/notification.service';
import {
  Notification,
  NotificationStatus,
  NotificationChannel,
  NotificationEventType,
} from './schemas/notification.schema';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { InAppService } from './services/in-app.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockNotificationModel: any;
  let mockTemplateModel: any;
  let mockPreferenceModel: any;
  let mockEventModel: any;
  let emailService: EmailService;
  let smsService: SmsService;
  let inAppService: InAppService;

  beforeEach(async () => {
    mockNotificationModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      updateMany: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      countDocuments: jest.fn(),
    };

    mockTemplateModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      findOne: jest.fn(),
    };

    mockPreferenceModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    mockEventModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      countDocuments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: EmailService,
          useValue: { sendEmail: jest.fn(), sendBulkEmail: jest.fn() },
        },
        {
          provide: SmsService,
          useValue: { sendSMS: jest.fn(), sendBulkSMS: jest.fn() },
        },
        {
          provide: InAppService,
          useValue: {
            recordInAppNotification: jest.fn(),
            recordBulkInAppNotifications: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
          },
        },
        {
          provide: getModelToken(Notification.name),
          useValue: mockNotificationModel,
        },
        {
          provide: getModelToken('NotificationTemplate'),
          useValue: mockTemplateModel,
        },
        {
          provide: getModelToken('NotificationPreference'),
          useValue: mockPreferenceModel,
        },
        {
          provide: getModelToken('NotificationEvent'),
          useValue: mockEventModel,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    emailService = module.get<EmailService>(EmailService);
    smsService = module.get<SmsService>(SmsService);
    inAppService = module.get<InAppService>(InAppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and send a notification', async () => {
      const createDto = {
        recipientId: 'user123',
        recipientEmail: 'test@example.com',
        eventType: NotificationEventType.ATTENDANCE_ALERT,
        channel: NotificationChannel.EMAIL,
        subject: 'Test Subject',
        message: 'Test Message',
      };

      const mockNotification = {
        ...createDto,
        _id: 'notif123',
        status: NotificationStatus.PENDING,
        save: jest.fn(),
      };

      mockNotificationModel.create.mockResolvedValue(mockNotification);
      mockPreferenceModel.findOne.mockResolvedValue(null);

      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({
        success: true,
        messageId: 'msg123',
      });

      await service.create(createDto);

      expect(mockNotificationModel.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findByRecipient', () => {
    it('should find notifications by recipient', async () => {
      const recipientId = 'user123';
      const mockNotifications = [
        {
          _id: 'notif1',
          recipientId,
          subject: 'Test 1',
        },
      ];

      mockNotificationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockNotifications),
            }),
          }),
        }),
      });

      const result = await service.findByRecipient(recipientId);

      expect(result).toEqual(mockNotifications);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockNotificationModel.countDocuments.mockResolvedValue(5);

      const result = await service.getUnreadCount('user123');

      expect(result).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        _id: 'notif123',
        isRead: true,
      };

      mockNotificationModel.findByIdAndUpdate.mockResolvedValue(
        mockNotification,
      );

      const result = await service.markAsRead('notif123');

      expect(result).toEqual(mockNotification);
    });
  });

  describe('getStatistics', () => {
    it('should return notification statistics', async () => {
      mockNotificationModel.countDocuments
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80) // sent
        .mockResolvedValueOnce(10) // failed
        .mockResolvedValueOnce(10) // pending
        .mockResolvedValueOnce(50) // read
        .mockResolvedValueOnce(50); // unread

      const result = await service.getStatistics('user123');

      expect(result).toEqual({
        total: 100,
        sent: 80,
        failed: 10,
        pending: 10,
        read: 50,
        unread: 50,
      });
    });
  });
});
