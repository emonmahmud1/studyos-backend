import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto } from './dto/pomodoro.dto';

@Injectable()
export class PomodoroService {
  constructor(private prisma: PrismaService) {}

  async createSession(userId: string, dto: CreateSessionDto) {
    const session = await this.prisma.pomodoroSession.create({
      data: { ...dto, userId },
    });

    // Award XP for completed focus sessions
    if (dto.completed && dto.mode === 'FOCUS') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: 200 } },
      });
    }

    return session;
  }

  async getSessions(userId: string, limit = 20) {
    return this.prisma.pomodoroSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSessions, todaySessions, completedFocusSessions] = await Promise.all([
      this.prisma.pomodoroSession.count({ where: { userId } }),
      this.prisma.pomodoroSession.findMany({
        where: { userId, createdAt: { gte: today } },
      }),
      this.prisma.pomodoroSession.findMany({
        where: { userId, mode: 'FOCUS', completed: true },
      }),
    ]);

    const totalFocusMinutes = completedFocusSessions.reduce((sum, s) => sum + s.duration, 0);
    const todayFocusMinutes = todaySessions
      .filter((s) => s.mode === 'FOCUS' && s.completed)
      .reduce((sum, s) => sum + s.duration, 0);

    return {
      totalSessions,
      completedFocusSessions: completedFocusSessions.length,
      totalFocusMinutes,
      todayFocusMinutes,
      todaySessions: todaySessions.length,
    };
  }
}
