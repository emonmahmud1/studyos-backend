import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, status?: TaskStatus) {
    return this.prisma.kanbanTask.findMany({
      where: { userId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { subject: { select: { name: true, color: true } } },
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.kanbanTask.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.kanbanTask.create({ data: { ...dto, userId } });
  }

  async update(id: string, userId: string, dto: UpdateTaskDto) {
    await this.findOne(id, userId);
    return this.prisma.kanbanTask.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.kanbanTask.delete({ where: { id } });
    return { message: 'Task deleted' };
  }
}
