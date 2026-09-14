import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { RolesGuard } from 'src/auth/roles-guard';
import { Roles } from 'src/auth/roles-decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  getCustomerBookings() {
    return this.bookingsService.getCustomerBookings();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('admin/:code')
  getAllBookingDetails(@Param('code') code: string) {
    return this.bookingsService.getAllBookingDetails(code);
  }

  @Get('current')
  getAllBookings(@CurrentUser() user: {id: string}) {
    return this.bookingsService.getAllBookings(user.id);
  }

  @Get(':code')
  getBookingDetail(@CurrentUser() user: {id: string}, @Param('code') code: string) {
    return this.bookingsService.getBookingDetail(user.id, code);
  }

  @Post()
  createBooking(@CurrentUser() user: {id: string}, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(user.id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':code')
  updateBooking(@CurrentUser() user: {id: string}, @Body() dto: UpdateBookingDto, @Param('code') code: string) {
    return this.bookingsService.updateBooking(user.id, code, dto);
  }
}
