import { Body, Controller, Get, HttpCode, NotFoundException, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({default: { ttl: 60000, limit: 5 }})
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({default: { ttl: 60000, limit: 5 }})
  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login success, returns access token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({default: { ttl: 60000, limit: 5 }})
  @Get('lookup-email')
  @ApiOperation({ summary: 'Check if an email is registered and get its user id (for forgot password flow)' })
  async lookupEmail(@Query('email') email: string) {
    const user = await this.authService.lookupEmail(email);
    if (!user) throw new NotFoundException('Email not found');
    return { id: user.id };
  }
}
