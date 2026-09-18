import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthRepository } from './auth.repository';
import { JwtAuthGuard } from './jwt-auth-guard';
import { RolesGuard } from './roles-guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if(!secret) throw new Error('JWT_SECRET is not set');
        return {
          secret,
          signOptions: { expiresIn: '1h'},
        };
      },
    }),
    PrismaModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 5,
    }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule, ThrottlerModule],
})
export class AuthModule {}
