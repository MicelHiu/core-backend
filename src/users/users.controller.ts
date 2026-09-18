import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('current')
  @ApiOperation({ summary: 'Get the currently logged-in user' })
  getCurrentUser(@CurrentUser() user: any) {
    return this.usersService.getUserById(user.id);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({default: { ttl: 60000, limit: 5 }})
  @Patch(':id')
  @ApiOperation({ summary: 'Reset password by id + email match (forgot password flow, no auth required)' })
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(id, dto);
  }
}
