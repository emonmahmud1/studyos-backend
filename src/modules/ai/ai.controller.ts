import { Controller, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ChatDto, SummarizeDto, GenerateFlashcardsDto } from './dto/ai.dto';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI Study Coach (Gemini)' })
  chat(@Body() dto: ChatDto) {
    return this.aiService.chat(dto);
  }

  @Post('summarize')
  @ApiOperation({ summary: 'Summarize study notes with AI' })
  summarize(@Body() dto: SummarizeDto) {
    return this.aiService.summarize(dto);
  }

  @Post('generate-flashcards')
  @ApiOperation({ summary: 'Generate flashcards for a topic using AI' })
  generateFlashcards(@Body() dto: GenerateFlashcardsDto) {
    return this.aiService.generateFlashcards(dto);
  }
}
