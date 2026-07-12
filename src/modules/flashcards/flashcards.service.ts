import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeckDto, UpdateDeckDto, CreateFlashcardDto, UpdateFlashcardDto, BulkCreateFlashcardsDto } from './dto/flashcard.dto';

@Injectable()
export class FlashcardsService {
  constructor(private prisma: PrismaService) {}

  // ── Decks ─────────────────────────────────────────────────────────────────
  findAllDecks(userId: string) {
    return this.prisma.flashcardDeck.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { cards: true, subject: { select: { name: true } } },
    });
  }

  async findOneDeck(id: string, userId: string) {
    const deck = await this.prisma.flashcardDeck.findFirst({
      where: { id, userId },
      include: { cards: true },
    });
    if (!deck) throw new NotFoundException('Deck not found');
    return deck;
  }

  async createDeck(userId: string, dto: CreateDeckDto) {
    return this.prisma.flashcardDeck.create({ data: { ...dto, userId } });
  }

  async updateDeck(id: string, userId: string, dto: UpdateDeckDto) {
    await this.findOneDeck(id, userId);
    return this.prisma.flashcardDeck.update({ where: { id }, data: dto });
  }

  async removeDeck(id: string, userId: string) {
    await this.findOneDeck(id, userId);
    await this.prisma.flashcardDeck.delete({ where: { id } });
    return { message: 'Deck deleted' };
  }

  // ── Cards ─────────────────────────────────────────────────────────────────
  async createCard(deckId: string, userId: string, dto: CreateFlashcardDto) {
    await this.findOneDeck(deckId, userId);
    return this.prisma.flashcard.create({ data: { ...dto, deckId } });
  }

  async bulkCreateCards(deckId: string, userId: string, dto: BulkCreateFlashcardsDto) {
    await this.findOneDeck(deckId, userId);
    return this.prisma.flashcard.createMany({
      data: dto.cards.map((c) => ({ ...c, deckId })),
    });
  }

  async updateCard(deckId: string, cardId: string, userId: string, dto: UpdateFlashcardDto) {
    await this.findOneDeck(deckId, userId);
    return this.prisma.flashcard.update({ where: { id: cardId }, data: dto });
  }

  async removeCard(deckId: string, cardId: string, userId: string) {
    await this.findOneDeck(deckId, userId);
    await this.prisma.flashcard.delete({ where: { id: cardId } });
    return { message: 'Card deleted' };
  }
}
