import { IsString, IsNumber, IsDate, IsOptional, IsEnum, IsMongoId } from 'class-validator';

export class CreateReceiptDto {
  @IsMongoId()
  studentId: string;

  @IsMongoId()
  feeCollectionId: string;

  @IsNumber()
  amountReceived: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsDate()
  paymentDate: Date;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @IsString()
  receivedBy: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateReceiptDto {
  @IsOptional()
  @IsEnum(['ISSUED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class ReceiptQueryDto {
  @IsOptional()
  @IsMongoId()
  studentId?: string;

  @IsOptional()
  @IsMongoId()
  feeCollectionId?: string;

  @IsOptional()
  receiptNumber?: string;

  @IsOptional()
  @IsEnum(['ISSUED', 'CANCELLED'])
  status?: string;
}
