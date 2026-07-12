import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiQuery({
    name: 'month',
    required: false,
    example: '2026-07',
    description: 'Filter by month (YYYY-MM)',
  })
  @ApiOperation({
    summary: 'Get all calendar events (optionally filter by month)',
  })
  findAll(@Request() req: any, @Query('month') month?: string) {
    return this.eventsService.findAll(req.user.userId, month);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.findOne(id, req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a calendar event' })
  create(@Request() req: any, @Body() dto: CreateEventDto) {
    return this.eventsService.create(req.user.userId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.remove(id, req.user.userId);
  }
}
