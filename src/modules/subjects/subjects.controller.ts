import { Controller, Get, Post, Patch, Delete, Param, Body, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';

@ApiTags('subjects')
@ApiBearerAuth()
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subjects for current user' })
  findAll(@Request() req: any) {
    return this.subjectsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single subject' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.subjectsService.findOne(id, req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new subject' })
  create(@Request() req: any, @Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subject' })
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subject' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.subjectsService.remove(id, req.user.userId);
  }
}
