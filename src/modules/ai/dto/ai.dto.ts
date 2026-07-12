import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @ApiProperty({ enum: ['user', 'coach'] })
  @IsString()
  role: 'user' | 'coach';

  @ApiProperty()
  @IsString()
  content: string;
}

export class ChatDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ type: [ChatMessageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];
}

export class SummarizeDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;
}

export class GenerateFlashcardsDto {
  @ApiProperty({ example: 'Binary Search Trees' })
  @IsString()
  topic: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  quantity?: number;
}
