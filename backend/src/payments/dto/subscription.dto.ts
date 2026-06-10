import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'The ID of the student subscribing to recurring payments',
    example: '60c72b2f9b1d8b2d88888888',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description:
      'The Price ID (Stripe) or Plan ID (Razorpay) for recurring fees',
    example: 'price_1OrABC123xyz',
  })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: 'The gateway to route the subscription billing',
    enum: ['STRIPE', 'RAZORPAY'],
    example: 'STRIPE',
  })
  @IsEnum(['STRIPE', 'RAZORPAY'])
  @IsNotEmpty()
  gateway: 'STRIPE' | 'RAZORPAY';
}
