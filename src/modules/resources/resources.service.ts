import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateResourceDto, UpdateResourceDto } from './dto/resource.dto';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, folder?: string) {
    return this.prisma.resourceItem.findMany({
      where: { userId, ...(folder ? { folder } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { subject: { select: { name: true } } },
    });
  }

  async findOne(id: string, userId: string) {
    const resource = await this.prisma.resourceItem.findFirst({ where: { id, userId } });
    if (!resource) throw new NotFoundException('Resource not found');
    return resource;
  }

  async create(userId: string, dto: CreateResourceDto) {
    return this.prisma.resourceItem.create({
      data: { ...dto, url: dto.url || '#', size: dto.size || '0 KB', userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateResourceDto) {
    await this.findOne(id, userId);
    return this.prisma.resourceItem.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.resourceItem.delete({ where: { id } });
    return { message: 'Resource deleted' };
  }
}
