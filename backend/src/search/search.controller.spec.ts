import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../tenant/tenant.guard';
import { ExecutionContext } from '@nestjs/common';

describe('SearchController', () => {
  let controller: SearchController;
  let service: SearchService;

  const mockSearchService = {
    getSuggestions: jest.fn(),
  };

  beforeEach(async () => {
    mockSearchService.getSuggestions.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSuggestions', () => {
    it('should call SearchService.getSuggestions with correct query', async () => {
      const mockResult = {
        results: [
          { id: '123', label: 'John Smith', type: 'student' },
        ],
      };
      mockSearchService.getSuggestions.mockResolvedValueOnce(mockResult);

      const queryDto: SearchQueryDto = { q: 'John' };
      const result = await controller.getSuggestions(queryDto);

      expect(service.getSuggestions).toHaveBeenCalledWith('John');
      expect(result).toEqual(mockResult);
    });
  });
});
