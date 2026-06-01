import { IsString, IsNumber, IsDate, IsOptional, IsEnum, IsMongoId } from 'class-validator';

export class CreateFeeCollectionDto {
  @IsMongoId()
  studentId: string;

  @IsMongoId()
  feeStructureId: string;

  @IsMongoId()
  classId: string;

  @IsMongoId()
  academicYearId: string;

  @IsNumber()
  amountDue: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsDate()
  dueDate: Date;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateFeeCollectionDto {
  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @IsOptional()
  @IsDate()
  paymentDate?: Date;

  @IsOptional()
  @IsEnum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'])
  status?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class FeeCollectionQueryDto {
  @IsOptional()
  @IsMongoId()
  studentId?: string;

  @IsOptional()
  @IsMongoId()
  classId?: string;

  @IsOptional()
  @IsMongoId()
  academicYearId?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'])
  status?: string;
}
