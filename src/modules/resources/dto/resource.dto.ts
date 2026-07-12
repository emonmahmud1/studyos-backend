import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { ResourceType } from '@prisma/client';

export class CreateResourceDto {
  @ApiProperty({ example: 'Week 3 Lecture Slides.pdf' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ResourceType })
  @IsEnum(ResourceType)
  type: ResourceType;

  @ApiPropertyOptional({ example: 'Lectures' })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({ example: 'https://drive.google.com/...' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: '2.4 MB' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;
}

export class UpdateResourceDto extends PartialType(CreateResourceDto) {}
