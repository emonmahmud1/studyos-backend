import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'STEM' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'indigo' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: '2026-08-15' })
  @IsOptional()
  @IsString()
  examDate?: string;

  @ApiPropertyOptional({ example: 0, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  mastery?: number;
}

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}
