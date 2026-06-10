import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsNumber, Min } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({
    description: 'The ID of the student the payment is being made for',
    example: '60c72b2f9b1d8b2d88888888',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'The ID of the Invoice to pay',
    example: '60c72b2f9b1d8b2d99999999',
  })
  @IsString()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({
    description: 'The payment gateway to route transaction through',
    enum: ['STRIPE', 'RAZORPAY', 'PHONEPE'],
    example: 'STRIPE',
  })
  @IsEnum(['STRIPE', 'RAZORPAY', 'PHONEPE'])
  @IsNotEmpty()
  gateway: 'STRIPE' | 'RAZORPAY' | 'PHONEPE';
}

export class RefundRequestDto {
  @ApiProperty({
    description: 'The ID of the Payment record to refund',
    example: '60c72b2f9b1d8b2d00000000',
  })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({
    description: 'The amount to refund in standard decimal currency (e.g. Rs 500.50)',
    example: 500.5,
  })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Reason for processing this refund',
    example: 'Duplicate payment made by parent',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class SimulatePaymentSuccessDto {
  @ApiProperty({
    description: 'The ID of the Payment record to simulate success for',
    example: '60c72b2f9b1d8b2d00000000',
  })
  @IsString()
  @IsNotEmpty()
  paymentId: string;
}

