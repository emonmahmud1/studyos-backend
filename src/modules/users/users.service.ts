import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    const user = await this.prisma.user.update({ where: { id }, data: dto });
    return this.sanitize(user);
  }

  async addXp(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const newXp = user.xp + amount;
    const newLevel = Math.floor(newXp / 2000) + 1;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel },
    });
    return { xp: updated.xp, level: updated.level };
  }

  private sanitize(user: any) {
    const { password, refreshToken, resetToken, resetTokenExpiry, ...safe } = user;
    return safe;
  }
}
