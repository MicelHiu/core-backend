import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { BookingRepository } from './bookings.repository';
import { CartsModule } from 'src/carts/carts.module';
import { CartsRepository } from 'src/carts/carts.repository';
import { DiscountsModule } from 'src/discounts/discounts.module';

@Module({
  imports: [PrismaModule, AuthModule, CartsModule, DiscountsModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingRepository],
})
export class BookingsModule {}
