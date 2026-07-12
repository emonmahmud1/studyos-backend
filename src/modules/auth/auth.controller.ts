import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new student account' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login and receive tokens' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto, @Request() req: any) {
    // userId comes from the refresh token payload (decode without verify for userId)
    return this.authService.refresh(req.body.userId, dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  logout(@Request() req: any) {
    return this.authService.logout(req.user.userId);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@Request() req: any) {
    return this.authService.me(req.user.userId);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset token' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
