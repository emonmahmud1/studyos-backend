import { Controller, Get, Patch, Body, Request, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  me(@Request() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  update(@Request() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, dto);
  }

  @Patch('me/xp')
  @ApiOperation({ summary: 'Add XP to current user' })
  addXp(@Request() req: any, @Body() body: { amount: number }) {
    return this.usersService.addXp(req.user.userId, body.amount);
  }
}
