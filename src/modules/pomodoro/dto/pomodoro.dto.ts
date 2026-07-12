import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { PomodoroMode } from '@prisma/client';

export class CreateSessionDto {
  @ApiProperty({ enum: PomodoroMode, default: 'FOCUS' })
  @IsEnum(PomodoroMode)
  mode: PomodoroMode;

  @ApiProperty({ example: 25, description: 'Duration in minutes' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
