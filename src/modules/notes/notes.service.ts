import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, folder?: string) {
    return this.prisma.note.findMany({
      where: { userId, ...(folder ? { folder } : {}) },
      orderBy: [{ pinned: 'desc' }, { lastModified: 'desc' }],
      include: { subject: { select: { name: true, color: true } } },
    });
  }

  async findOne(id: string, userId: string) {
    const note = await this.prisma.note.findFirst({ where: { id, userId } });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async create(userId: string, dto: CreateNoteDto) {
    return this.prisma.note.create({
      data: { ...dto, userId, lastModified: new Date() },
    });
  }

  async update(id: string, userId: string, dto: UpdateNoteDto) {
    await this.findOne(id, userId);
    return this.prisma.note.update({
      where: { id },
      data: { ...dto, lastModified: new Date() },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.note.delete({ where: { id } });
    return { message: 'Note deleted' };
  }

  async togglePin(id: string, userId: string) {
    const note = await this.findOne(id, userId);
    return this.prisma.note.update({
      where: { id },
      data: { pinned: !note.pinned },
    });
  }
}
