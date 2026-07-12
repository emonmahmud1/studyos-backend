import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ example: 'Binary Trees Overview' })
  @IsString()
  title: string;

  @ApiProperty({ example: '# Binary Trees\n\nA tree data structure...' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @ApiPropertyOptional({ example: ['EXAM', 'PRIORITY'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;
}

export class UpdateNoteDto extends PartialType(CreateNoteDto) {}
