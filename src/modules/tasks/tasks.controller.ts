import { Controller, Get, Post, Patch, Delete, Param, Body, Request, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus })
  @ApiOperation({ summary: 'Get all tasks (optionally filter by status)' })
  findAll(@Request() req: any, @Query('status') status?: TaskStatus) {
    return this.tasksService.findAll(req.user.userId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@Request() req: any, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task (use to move Kanban columns)' })
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.remove(id, req.user.userId);
  }
}
