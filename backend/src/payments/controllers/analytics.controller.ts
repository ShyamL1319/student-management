import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';

@ApiTags('Payment Analytics')
@Controller('payments/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RevenueAnalyticsController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('revenue')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get total revenue collections, refunds, failure rate, and MRR' })
  async getRevenueStats() {
    return this.paymentService.getRevenueAnalytics();
  }
}
