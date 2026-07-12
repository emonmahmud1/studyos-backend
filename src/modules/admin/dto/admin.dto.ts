import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}

export class AdminAddXpDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount: number;
}

export class AdminQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
