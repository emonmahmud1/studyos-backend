import { Controller, Get, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get full user profile with study statistics' })
  getProfile(@Request() req: any) {
    return this.profileService.getFullProfile(req.user.userId);
  }
}
