import { IsString, IsNumber, IsDate, IsOptional, IsEnum, IsMongoId } from 'class-validator';

export class CreateFeeStructureDto {
  @IsMongoId()
  classId: string;

  @IsMongoId()
  academicYearId: string;

  @IsString()
  feeName: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsDate()
  dueDate: Date;

  @IsOptional()
  @IsEnum(['MONTHLY', 'QUARTERLY', 'SEMESTER', 'ANNUAL'])
  frequency?: string;

  @IsOptional()
  @IsEnum(['APPLICABLE', 'OPTIONAL'])
  applicability?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateFeeStructureDto {
  @IsOptional()
  @IsString()
  feeName?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsEnum(['MONTHLY', 'QUARTERLY', 'SEMESTER', 'ANNUAL'])
  frequency?: string;

  @IsOptional()
  @IsEnum(['APPLICABLE', 'OPTIONAL'])
  applicability?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class FeeStructureQueryDto {
  @IsOptional()
  @IsMongoId()
  classId?: string;

  @IsOptional()
  @IsMongoId()
  academicYearId?: string;

  @IsOptional()
  isActive?: boolean;
}
