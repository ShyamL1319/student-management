import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../tenant/tenant.guard';

@ApiTags('Search')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions for users' })
  @ApiQuery({ name: 'q', type: String, required: true, description: 'Query text' })
  @ApiResponse({ status: 200, description: 'List of matching suggestions' })
  async getSuggestions(@Query() dto: SearchQueryDto) {
    return this.searchService.getSuggestions(dto.q);
  }
}
