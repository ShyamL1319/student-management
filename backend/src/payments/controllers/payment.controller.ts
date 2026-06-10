import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import {
  InitiatePaymentDto,
  RefundRequestDto,
  SimulatePaymentSuccessDto,
} from '../dto/payment.dto';
import { CreateSubscriptionDto } from '../dto/subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/role.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  @Post('initiate')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.PARENT)
  @ApiOperation({ summary: 'Initiate payment session for Stripe/Razorpay' })
  async initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiatePayment(
      dto.studentId,
      dto.invoiceId,
      dto.gateway,
    );
  }

  @Post('refund')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Initiate a transaction refund' })
  async refundPayment(@Body() dto: RefundRequestDto) {
    return this.paymentService.initiateRefund(
      dto.paymentId,
      dto.amount,
      dto.reason,
    );
  }

  @Post('subscriptions/create')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.PARENT)
  @ApiOperation({
    summary: 'Create a payment subscription plan for monthly auto-billing',
  })
  async createSubscription(@Body() dto: CreateSubscriptionDto) {
    return this.paymentService.createSubscription(
      dto.studentId,
      dto.planId,
      dto.gateway,
    );
  }

  @Post('subscriptions/:id/cancel')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.PARENT)
  @ApiOperation({ summary: 'Cancel an active recurring fee subscription' })
  async cancelSubscription(@Param('id') id: string) {
    return this.paymentService.cancelSubscription(id);
  }

  @Get('student/:studentId')
  @Roles(
    RoleEnum.ADMIN,
    RoleEnum.SUPER_ADMIN,
    RoleEnum.PARENT,
    RoleEnum.STUDENT,
  )
  @ApiOperation({ summary: 'Get payment transaction history for a student' })
  async getStudentPayments(@Param('studentId') studentId: string) {
    return this.paymentModel.find({ studentId }).sort({ createdAt: -1 }).exec();
  }

  @Post('simulate-success')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.PARENT)
  @ApiOperation({ summary: 'Simulate a successful payment for testing/demo' })
  async simulatePaymentSuccess(@Body() dto: SimulatePaymentSuccessDto) {
    const payment = await this.paymentModel.findById(dto.paymentId);
    if (!payment) {
      throw new NotFoundException(
        `Payment record with ID ${dto.paymentId} not found`,
      );
    }
    await this.paymentService.processPaymentSuccess(
      payment.gatewayTransactionId,
      `MOCK-PAY-${Date.now()}`,
      { mock: true, simulated: true },
    );
    return { success: true, message: 'Simulated payment success successfully' };
  }
}
