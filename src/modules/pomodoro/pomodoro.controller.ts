import { Controller, Get, Post, Body, Request, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PomodoroService } from './pomodoro.service';
import { CreateSessionDto } from './dto/pomodoro.dto';

@ApiTags('pomodoro')
@ApiBearerAuth()
@Controller('pomodoro')
export class PomodoroController {
  constructor(private readonly pomodoroService: PomodoroService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Log a completed pomodoro session' })
  createSession(@Request() req: any, @Body() dto: CreateSessionDto) {
    return this.pomodoroService.createSession(req.user.userId, dto);
  }

  @Get('sessions')
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOperation({ summary: 'Get recent pomodoro sessions' })
  getSessions(@Request() req: any, @Query('limit') limit?: number) {
    return this.pomodoroService.getSessions(req.user.userId, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get pomodoro statistics (today + total)' })
  getStats(@Request() req: any) {
    return this.pomodoroService.getStats(req.user.userId);
  }
}
