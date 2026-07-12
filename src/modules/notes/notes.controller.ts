import { Controller, Get, Post, Patch, Delete, Param, Body, Request, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';

@ApiTags('notes')
@ApiBearerAuth()
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiQuery({ name: 'folder', required: false })
  @ApiOperation({ summary: 'Get all notes (optionally filter by folder)' })
  findAll(@Request() req: any, @Query('folder') folder?: string) {
    return this.notesService.findAll(req.user.userId, folder);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single note' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.notesService.findOne(id, req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  create(@Request() req: any, @Body() dto: CreateNoteDto) {
    return this.notesService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note' })
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(id, req.user.userId, dto);
  }

  @Patch(':id/pin')
  @ApiOperation({ summary: 'Toggle pin status of a note' })
  togglePin(@Param('id') id: string, @Request() req: any) {
    return this.notesService.togglePin(id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.notesService.remove(id, req.user.userId);
  }
}
