import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { BookingRepository } from './bookings.repository';
import { CartsModule } from 'src/carts/carts.module';
import { CartsRepository } from 'src/carts/carts.repository';
import { RoomsModule } from 'src/rooms/rooms.module';
import { DiscountsModule } from 'src/discounts/discounts.module';
import { VisitorsModule } from 'src/visitors/visitors.module';
import { ActivityLogsModule } from 'src/activity-logs/activity-logs.module';

@Module({
  imports: [PrismaModule, AuthModule, CartsModule, RoomsModule, DiscountsModule, VisitorsModule, ActivityLogsModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingRepository],
})
export class BookingsModule {}
