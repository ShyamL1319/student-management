import { Test, TestingModule } from '@nestjs/testing';
import { InAppService } from './services/in-app.service';

describe('InAppService', () => {
  let service: InAppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InAppService],
    }).compile();

    service = module.get<InAppService>(InAppService);
  });

  describe('recordInAppNotification', () => {
    it('should record in-app notification', async () => {
      const result = await service.recordInAppNotification(
        'user123',
        'Test message',
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const result = await service.markAsRead('notif123');

      expect(result).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const result = await service.markAllAsRead('user123');

      expect(result).toBeGreaterThanOrEqual(0);
    });
  });
});
