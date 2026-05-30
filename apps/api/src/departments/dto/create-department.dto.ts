import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Computer Science', description: 'The name of the department' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'CS', description: 'The code of the department' })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiPropertyOptional({ example: 'Department of Computer Science', description: 'Description of the department' })
  @IsOptional()
  @IsString()
  description?: string;
}
