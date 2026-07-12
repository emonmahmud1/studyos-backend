import { Controller, Get, Post, Patch, Delete, Param, Body, Request, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { CreateResourceDto, UpdateResourceDto } from './dto/resource.dto';

@ApiTags('resources')
@ApiBearerAuth()
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiQuery({ name: 'folder', required: false })
  @ApiOperation({ summary: 'Get all resources (optionally filter by folder)' })
  findAll(@Request() req: any, @Query('folder') folder?: string) {
    return this.resourcesService.findAll(req.user.userId, folder);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.resourcesService.findOne(id, req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a resource reference to the vault' })
  create(@Request() req: any, @Body() dto: CreateResourceDto) {
    return this.resourcesService.create(req.user.userId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateResourceDto) {
    return this.resourcesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.resourcesService.remove(id, req.user.userId);
  }
}
