import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { ChatDto, SummarizeDto, GenerateFlashcardsDto } from './dto/ai.dto';

@Injectable()
export class AiService {
  private ai: GoogleGenAI | null = null;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  private getAi(): GoogleGenAI {
    if (!this.ai) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY is not configured. Add it to the .env file to enable AI features.',
      );
    }
    return this.ai;
  }

  async chat(dto: ChatDto) {
    const systemInstruction = `You are an expert AI Study Coach inside a student productivity platform called Study OS.
You help students with study strategies, time management, exam preparation, and academic questions.
Keep responses concise, encouraging, and actionable. Use markdown formatting when helpful.`;

    const historyMessages = (dto.history || []).slice(-10).map((msg) => ({
      role: msg.role === 'coach' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = this.getAi().chats.create({
      model: 'gemini-2.0-flash',
      config: { systemInstruction },
      history: historyMessages,
    });

    const response = await chat.sendMessage({ message: dto.message });
    return { reply: response.text };
  }

  async summarize(dto: SummarizeDto) {
    const prompt = `You are an expert academic note summarizer. Summarize the following study note in a structured, concise markdown format.
Include: Key Concepts, Main Points (bullet list), and a 2-sentence conclusion.

Title: ${dto.title}

Content:
${dto.content}`;

    const response = await this.getAi().models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return { summary: response.text };
  }

  async generateFlashcards(dto: GenerateFlashcardsDto) {
    const quantity = dto.quantity || 5;
    const prompt = `Generate ${quantity} high-quality academic flashcards about: "${dto.topic}".
Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{"cards": [{"question": "...", "answer": "..."}, ...]}

Make questions specific and answers detailed but concise. Focus on key concepts, definitions, and relationships.`;

    const response = await this.getAi().models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text?.trim() || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new InternalServerErrorException('Invalid response from AI');

    return JSON.parse(jsonMatch[0]);
  }
}
