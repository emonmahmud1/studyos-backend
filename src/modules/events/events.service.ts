import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, month?: string) {
    return this.prisma.calendarEvent.findMany({
      where: { userId, ...(month ? { date: { startsWith: month } } : {}) },
      orderBy: { date: 'asc' },
      include: { subject: { select: { name: true, color: true } } },
    });
  }

  async findOne(id: string, userId: string) {
    const event = await this.prisma.calendarEvent.findFirst({ where: { id, userId } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(userId: string, dto: CreateEventDto) {
    return this.prisma.calendarEvent.create({ data: { ...dto, userId } });
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    await this.findOne(id, userId);
    return this.prisma.calendarEvent.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.calendarEvent.delete({ where: { id } });
    return { message: 'Event deleted' };
  }
}
