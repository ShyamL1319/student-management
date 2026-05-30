import { Type, plainToInstance } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  PORT = 3000;

  @IsString()
  @IsNotEmpty()
  MONGODB_URI!: string;

  @IsString()
  @MinLength(32)
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN!: string;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN!: string;

  @IsString()
  @IsOptional()
  SEED_ADMIN_NAME?: string;

  @IsEmail()
  @IsOptional()
  SEED_ADMIN_EMAIL?: string;

  @IsString()
  @IsOptional()
  SEED_ADMIN_PASSWORD?: string;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
