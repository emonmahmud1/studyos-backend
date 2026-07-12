import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import { UpdateUserRoleDto, AdminAddXpDto, AdminQueryDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ── Overview ────────────────────────────────────────────────────────────────
  async getOverview() {
    const [
      totalUsers,
      totalNotes,
      totalTasks,
      completedTasks,
      totalSubjects,
      totalDecks,
      totalEvents,
      totalResources,
      totalPomodoroSessions,
      completedPomodoro,
      totalFocusMinutes,
      recentUsers,
      topUsers,
      featureUsage,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.note.count(),
      this.prisma.kanbanTask.count(),
      this.prisma.kanbanTask.count({ where: { status: 'COMPLETED' } }),
      this.prisma.subject.count(),
      this.prisma.flashcardDeck.count(),
      this.prisma.calendarEvent.count(),
      this.prisma.resourceItem.count(),
      this.prisma.pomodoroSession.count(),
      this.prisma.pomodoroSession.count({ where: { completed: true, mode: 'FOCUS' } }),
      this.prisma.pomodoroSession.aggregate({
        where: { completed: true, mode: 'FOCUS' },
        _sum: { duration: true },
      }),
      // New users last 7 days
      this.prisma.user.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, xp: true, level: true, createdAt: true },
      }),
      // Top users by XP
      this.prisma.user.findMany({
        orderBy: { xp: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, xp: true, level: true, streak: true },
      }),
      // Feature usage counts
      Promise.all([
        this.prisma.note.count(),
        this.prisma.kanbanTask.count(),
        this.prisma.flashcardDeck.count(),
        this.prisma.pomodoroSession.count(),
        this.prisma.calendarEvent.count(),
        this.prisma.resourceItem.count(),
      ]),
    ]);

    // User growth last 30 days (group by day)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const rawGrowth = await this.prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const growthMap: Record<string, number> = {};
    rawGrowth.forEach((u) => {
      const day = u.createdAt.toISOString().split('T')[0];
      growthMap[day] = (growthMap[day] || 0) + 1;
    });
    const userGrowth = Object.entries(growthMap).map(([date, count]) => ({ date, count }));

    const [fNotes, fTasks, fDecks, fPomodoro, fEvents, fResources] = featureUsage;

    return {
      kpis: {
        totalUsers,
        totalNotes,
        totalTasks,
        completedTasks,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalSubjects,
        totalDecks,
        totalEvents,
        totalResources,
        totalPomodoroSessions,
        completedPomodoro,
        totalFocusMinutes: totalFocusMinutes._sum.duration || 0,
      },
      userGrowth,
      recentUsers,
      topUsers,
      featureUsage: [
        { name: 'Notes', count: fNotes },
        { name: 'Tasks', count: fTasks },
        { name: 'Flashcard Decks', count: fDecks },
        { name: 'Pomodoro Sessions', count: fPomodoro },
        { name: 'Calendar Events', count: fEvents },
        { name: 'Resources', count: fResources },
      ],
    };
  }

  // ── Users ───────────────────────────────────────────────────────────────────
  async getUsers(query: AdminQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.role) {
      where.role = query.role as Role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, role: true, avatar: true,
          xp: true, level: true, streak: true, lastActiveDate: true,
          createdAt: true, updatedAt: true,
          _count: {
            select: {
              notes: true, tasks: true, subjects: true,
              decks: true, sessions: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, avatar: true,
        xp: true, level: true, streak: true, lastActiveDate: true,
        createdAt: true, updatedAt: true,
        _count: { select: { notes: true, tasks: true, subjects: true, decks: true, sessions: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserRole(id: string, dto: UpdateUserRoleDto) {
    await this.getUserById(id);
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async addXpToUser(id: string, dto: AdminAddXpDto) {
    await this.getUserById(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        xp: { increment: dto.amount },
        level: { set: Math.floor(((await this.prisma.user.findUnique({ where: { id }, select: { xp: true } }))!.xp + dto.amount) / 2000) + 1 },
      },
      select: { id: true, name: true, xp: true, level: true },
    });
    return user;
  }

  async deleteUser(id: string) {
    await this.getUserById(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  async resetUserPassword(id: string) {
    await this.getUserById(id);
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiry = new Date(Date.now() + 3600000);
    await this.prisma.user.update({
      where: { id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });
    return { message: 'Password reset token generated', token };
  }

  // ── Analytics ───────────────────────────────────────────────────────────────
  async getAnalytics() {
    const [
      pomodoroByMode,
      tasksByStatus,
      tasksByPriority,
      notesByFolder,
      eventsByType,
      resourcesByType,
      topActiveUsers,
      dailyPomodoro,
    ] = await Promise.all([
      // Pomodoro by mode
      this.prisma.pomodoroSession.groupBy({
        by: ['mode'],
        _count: { id: true },
        _sum: { duration: true },
      }),
      // Tasks by status
      this.prisma.kanbanTask.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // Tasks by priority
      this.prisma.kanbanTask.groupBy({
        by: ['priority'],
        _count: { id: true },
      }),
      // Notes by folder
      this.prisma.note.groupBy({
        by: ['folder'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 8,
      }),
      // Events by type
      this.prisma.calendarEvent.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
      // Resources by type
      this.prisma.resourceItem.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
      // Top 10 users by focus time
      this.prisma.user.findMany({
        take: 10,
        orderBy: { xp: 'desc' },
        select: {
          id: true, name: true, email: true, xp: true, level: true, streak: true,
          _count: { select: { sessions: true, notes: true, tasks: true } },
        },
      }),
      // Daily pomodoro sessions last 14 days
      this.prisma.pomodoroSession.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 14 * 86400000) },
          completed: true,
        },
        select: { createdAt: true, duration: true, mode: true },
      }),
    ]);

    // Group daily pomodoro
    const dailyMap: Record<string, { sessions: number; minutes: number }> = {};
    dailyPomodoro.forEach((s) => {
      const day = s.createdAt.toISOString().split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { sessions: 0, minutes: 0 };
      dailyMap[day].sessions += 1;
      dailyMap[day].minutes += s.duration;
    });
    const dailyPomodoroChart = Object.entries(dailyMap)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      pomodoroByMode: pomodoroByMode.map((p) => ({
        mode: p.mode,
        count: p._count.id,
        totalMinutes: p._sum.duration || 0,
      })),
      tasksByStatus: tasksByStatus.map((t) => ({ status: t.status, count: t._count.id })),
      tasksByPriority: tasksByPriority.map((t) => ({ priority: t.priority, count: t._count.id })),
      notesByFolder: notesByFolder.map((n) => ({ folder: n.folder, count: n._count.id })),
      eventsByType: eventsByType.map((e) => ({ type: e.type, count: e._count.id })),
      resourcesByType: resourcesByType.map((r) => ({ type: r.type, count: r._count.id })),
      topActiveUsers,
      dailyPomodoroChart,
    };
  }

  // ── Gamification ────────────────────────────────────────────────────────────
  async getGamification() {
    const [xpLeaderboard, streakLeaderboard, levelDistribution] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { xp: 'desc' },
        take: 50,
        select: { id: true, name: true, email: true, xp: true, level: true, streak: true, avatar: true },
      }),
      this.prisma.user.findMany({
        orderBy: { streak: 'desc' },
        where: { streak: { gt: 0 } },
        take: 20,
        select: { id: true, name: true, email: true, xp: true, streak: true },
      }),
      this.prisma.user.groupBy({
        by: ['level'],
        _count: { id: true },
        orderBy: { level: 'asc' },
      }),
    ]);

    return {
      xpLeaderboard,
      streakLeaderboard,
      levelDistribution: levelDistribution.map((l) => ({ level: l.level, users: l._count.id })),
    };
  }

  // ── System ──────────────────────────────────────────────────────────────────
  async getSystemInfo() {
    const [userCount, noteCount, sessionCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.note.count(),
      this.prisma.pomodoroSession.count(),
    ]);

    return {
      app: {
        name: 'Study OS API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        port: process.env.APP_PORT || 3001,
        uptime: Math.floor(process.uptime()),
        nodeVersion: process.version,
      },
      database: {
        status: 'connected',
        provider: 'PostgreSQL (Neon)',
        users: userCount,
        notes: noteCount,
        pomodoroSessions: sessionCount,
      },
      ai: {
        provider: 'Google Gemini',
        model: 'gemini-2.0-flash',
        configured: !!process.env.GEMINI_API_KEY,
      },
      features: {
        registration: true,
        aiFeatures: !!process.env.GEMINI_API_KEY,
        maintenanceMode: false,
      },
    };
  }
}
