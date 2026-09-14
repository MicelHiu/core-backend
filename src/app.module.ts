import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CartsModule } from './carts/carts.module';
import { BookingsModule } from './bookings/bookings.module';
import { VisitorsModule } from './visitors/visitors.module';
import { UsersModule } from './users/users.module';
import { DiscountsModule } from './discounts/discounts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    RoomsModule, 
    AuthModule, CartsModule, BookingsModule, VisitorsModule, UsersModule, DiscountsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
