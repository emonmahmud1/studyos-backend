import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { EventType } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty({ example: 'Calculus Midterm Exam' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ enum: EventType, default: 'STUDY' })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiProperty({ example: '2026-07-20' })
  @IsString()
  date: string;

  @ApiProperty({ example: '09:00 - 11:00' })
  @IsString()
  time: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}
