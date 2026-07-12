import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getFullProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            subjects: true,
            notes: true,
            tasks: true,
            decks: true,
            events: true,
            sessions: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const completedTasks = await this.prisma.kanbanTask.count({
      where: { userId, status: 'COMPLETED' },
    });
    const focusStats = await this.prisma.pomodoroSession.aggregate({
      where: { userId, mode: 'FOCUS', completed: true },
      _sum: { duration: true },
      _count: true,
    });

    const { password, refreshToken, resetToken, resetTokenExpiry, ...safeUser } = user;

    return {
      ...safeUser,
      stats: {
        totalSubjects: user._count.subjects,
        totalNotes: user._count.notes,
        totalTasks: user._count.tasks,
        completedTasks,
        totalDecks: user._count.decks,
        totalEvents: user._count.events,
        pomodoroSessions: user._count.sessions,
        totalFocusMinutes: focusStats._sum.duration || 0,
        completedPomodoros: focusStats._count,
      },
    };
  }
}
