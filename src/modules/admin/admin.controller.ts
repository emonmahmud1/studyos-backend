import {
  Controller, Get, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto, AdminAddXpDto, AdminQueryDto } from './dto/admin.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Overview
  @Get('overview')
  @ApiOperation({ summary: 'Platform overview stats and KPIs' })
  getOverview() {
    return this.adminService.getOverview();
  }

  // Users
  @Get('users')
  @ApiOperation({ summary: 'List all users with pagination and search' })
  getUsers(@Query() query: AdminQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get single user details' })
  getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role (USER / ADMIN)' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto);
  }

  @Patch('users/:id/xp')
  @ApiOperation({ summary: 'Manually award XP to a user' })
  addXp(@Param('id') id: string, @Body() dto: AdminAddXpDto) {
    return this.adminService.addXpToUser(id, dto);
  }

  @Patch('users/:id/reset-password')
  @ApiOperation({ summary: 'Force generate password reset token for user' })
  resetPassword(@Param('id') id: string) {
    return this.adminService.resetUserPassword(id);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete a user and all their data' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Analytics
  @Get('analytics')
  @ApiOperation({ summary: 'Detailed platform analytics and usage charts' })
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  // Gamification
  @Get('gamification')
  @ApiOperation({ summary: 'XP leaderboard, streak leaders, level distribution' })
  getGamification() {
    return this.adminService.getGamification();
  }

  // System
  @Get('system')
  @ApiOperation({ summary: 'System info, DB status, feature flags' })
  getSystemInfo() {
    return this.adminService.getSystemInfo();
  }
}
