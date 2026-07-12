import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Complete Chapter 4 exercises' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: 'TODO' })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, default: 'MEDIUM' })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '2026-07-20' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
