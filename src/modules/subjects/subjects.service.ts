import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.subject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { notes: true, tasks: true } } },
    });
  }

  async findOne(id: string, userId: string) {
    const subject = await this.prisma.subject.findFirst({ where: { id, userId } });
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async create(userId: string, dto: CreateSubjectDto) {
    return this.prisma.subject.create({ data: { ...dto, userId } });
  }

  async update(id: string, userId: string, dto: UpdateSubjectDto) {
    await this.findOne(id, userId);
    return this.prisma.subject.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.subject.delete({ where: { id } });
    return { message: 'Subject deleted' };
  }
}
