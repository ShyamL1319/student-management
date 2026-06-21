import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { getConnectionToken } from '@nestjs/mongoose';
import * as Sentry from '@sentry/nestjs';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@sentry/nestjs', () => {
  return {
    metrics: {
      count: jest.fn(),
      distribution: jest.fn(),
    },
  };
});

describe('HealthController', () => {
  let controller: HealthController;
  let mockConnection: any;

  beforeEach(async () => {
    mockConnection = {
      readyState: 1,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('triggerMetric', () => {
    it('should trigger custom Sentry metrics and return status ok', () => {
      const result = controller.triggerMetric();

      expect(result.status).toBe('ok');
      expect(result.metrics.count).toBe('backend.test_metric.count');
      expect(result.metrics.distribution).toBe('backend.test_metric.duration');

      // Assert Sentry metrics calls
      expect(Sentry.metrics.count).toHaveBeenCalledWith(
        'backend.test_metric.count',
        1,
        expect.objectContaining({
          attributes: {
            source: 'health_controller',
            stage: 'verification',
          },
        }),
      );
      expect(Sentry.metrics.distribution).toHaveBeenCalledWith(
        'backend.test_metric.duration',
        expect.any(Number),
        expect.objectContaining({
          unit: 'millisecond',
          attributes: {
            source: 'health_controller',
            stage: 'verification',
          },
        }),
      );
    });
  });
});
