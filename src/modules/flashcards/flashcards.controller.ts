import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FlashcardsService } from './flashcards.service';
import {
  CreateDeckDto,
  UpdateDeckDto,
  CreateFlashcardDto,
  UpdateFlashcardDto,
  BulkCreateFlashcardsDto,
} from './dto/flashcard.dto';

@ApiTags('flashcards')
@ApiBearerAuth()
@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  // Decks
  @Get('decks')
  @ApiOperation({ summary: 'Get all flashcard decks with cards' })
  findAllDecks(@Request() req: any) {
    return this.flashcardsService.findAllDecks(req.user.userId);
  }

  @Get('decks/:id')
  findOneDeck(@Param('id') id: string, @Request() req: any) {
    return this.flashcardsService.findOneDeck(id, req.user.userId);
  }

  @Post('decks')
  @ApiOperation({ summary: 'Create a new flashcard deck' })
  createDeck(@Request() req: any, @Body() dto: CreateDeckDto) {
    return this.flashcardsService.createDeck(req.user.userId, dto);
  }

  @Patch('decks/:id')
  updateDeck(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateDeckDto,
  ) {
    return this.flashcardsService.updateDeck(id, req.user.userId, dto);
  }

  @Delete('decks/:id')
  removeDeck(@Param('id') id: string, @Request() req: any) {
    return this.flashcardsService.removeDeck(id, req.user.userId);
  }

  // Cards
  @Post('decks/:deckId/cards')
  @ApiOperation({ summary: 'Add a single card to a deck' })
  createCard(
    @Param('deckId') deckId: string,
    @Request() req: any,
    @Body() dto: CreateFlashcardDto,
  ) {
    return this.flashcardsService.createCard(deckId, req.user.userId, dto);
  }

  @Post('decks/:deckId/cards/bulk')
  @ApiOperation({
    summary: 'Bulk add cards to a deck (e.g. from AI generator)',
  })
  bulkCreateCards(
    @Param('deckId') deckId: string,
    @Request() req: any,
    @Body() dto: BulkCreateFlashcardsDto,
  ) {
    return this.flashcardsService.bulkCreateCards(deckId, req.user.userId, dto);
  }

  @Patch('decks/:deckId/cards/:cardId')
  @ApiOperation({
    summary:
      'Update a card (e.g. set recall status: AGAIN | HARD | GOOD | EASY)',
  })
  updateCard(
    @Param('deckId') deckId: string,
    @Param('cardId') cardId: string,
    @Request() req: any,
    @Body() dto: UpdateFlashcardDto,
  ) {
    return this.flashcardsService.updateCard(
      deckId,
      cardId,
      req.user.userId,
      dto,
    );
  }

  @Delete('decks/:deckId/cards/:cardId')
  removeCard(
    @Param('deckId') deckId: string,
    @Param('cardId') cardId: string,
    @Request() req: any,
  ) {
    return this.flashcardsService.removeCard(deckId, cardId, req.user.userId);
  }
}
