import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { CardStatus } from '@prisma/client';

export class CreateDeckDto {
  @ApiProperty({ example: 'Data Structures Fundamentals' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;
}

export class UpdateDeckDto extends PartialType(CreateDeckDto) {
  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  progress?: number;
}

export class CreateFlashcardDto {
  @ApiProperty({ example: 'What is a Binary Search Tree?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'A BST is a tree where left child < parent < right child.' })
  @IsString()
  answer: string;
}

export class UpdateFlashcardDto extends PartialType(CreateFlashcardDto) {
  @ApiPropertyOptional({ enum: CardStatus })
  @IsOptional()
  @IsEnum(CardStatus)
  status?: CardStatus;
}

export class BulkCreateFlashcardsDto {
  @ApiProperty({ type: [CreateFlashcardDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFlashcardDto)
  cards: CreateFlashcardDto[];
}
