import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ── Register ──────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashed },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitize(user), ...tokens };
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    let streak = user.streak;
    if (user.lastActiveDate) {
      const last = new Date(user.lastActiveDate);
      const diff = Math.floor((Date.now() - last.getTime()) / 86400000);
      if (diff === 1) streak += 1;
      else if (diff > 1) streak = 1;
    } else {
      streak = 1;
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10), streak, lastActiveDate: today },
    });

    return { user: this.sanitize(user), ...tokens };
  }

  // ── Refresh ───────────────────────────────────────────────────────────────
  async refresh(userId: string, rawRefreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const match = await bcrypt.compare(rawRefreshToken, user.refreshToken);
    if (!match) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    return { message: 'Logged out successfully' };
  }

  // ── Forgot Password ───────────────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('Email not found');

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    // In production: send email with token
    return { message: 'Password reset token generated', token };
  }

  // ── Reset Password ────────────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: dto.token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const hashed = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null, refreshToken: null },
    });

    return { message: 'Password reset successfully' };
  }

  // ── Me ────────────────────────────────────────────────────────────────────
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const secret = this.config.get<string>('jwt.secret');
    const refreshSecret = this.config.get<string>('jwt.refreshSecret');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { secret, expiresIn: this.config.get('jwt.expiresIn') || '15m' }),
      this.jwt.signAsync(payload, { secret: refreshSecret, expiresIn: this.config.get('jwt.refreshExpiresIn') || '7d' }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const hashed = await bcrypt.hash(token, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: hashed } });
  }

  private sanitize(user: any) {
    const { password, refreshToken, resetToken, resetTokenExpiry, ...safe } = user;
    return safe;
  }
}
