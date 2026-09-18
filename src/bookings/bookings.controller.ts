import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { RolesGuard } from 'src/auth/roles-guard';
import { Roles } from 'src/auth/roles-decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Get all customer bookings (admin only)' })
  getCustomerBookings() {
    return this.bookingsService.getCustomerBookings();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('admin/:code')
  @ApiOperation({ summary: 'Get booking details by code (admin only)' })
  @ApiParam({ name: 'code', description: 'Booking code' })
  getAllBookingDetails(@Param('code') code: string) {
    return this.bookingsService.getAllBookingDetails(code);
  }

  @Get('current')
  @ApiOperation({ summary: "Get the current user's bookings" })
  getAllBookings(@CurrentUser() user: {id: string}) {
    return this.bookingsService.getAllBookings(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get(':code/activity-logs')
  @ApiOperation({ summary: 'Get activity/status-change log history for a booking (admin only)' })
  @ApiParam({ name: 'code', description: 'Booking code' })
  getActivityLogs(@Param('code') code: string) {
    return this.bookingsService.getActivityLogs(code);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get booking detail by code' })
  @ApiParam({ name: 'code', description: 'Booking code' })
  getBookingDetail(@CurrentUser() user: {id: string}, @Param('code') code: string) {
    return this.bookingsService.getBookingDetail(user.id, code);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  createBooking(@CurrentUser() user: {id: string}, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(user.id, dto);
  }

  @Patch(':code/cancel')
  @ApiOperation({ summary: "Cancel the current user's own booking (only while status is 'confirmed')" })
  @ApiParam({ name: 'code', description: 'Booking code' })
  cancelBooking(@CurrentUser() user: {id: string}, @Param('code') code: string) {
    return this.bookingsService.cancelBooking(user.id, code);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':code')
  @ApiOperation({ summary: 'Update a booking (admin only)' })
  @ApiParam({ name: 'code', description: 'Booking code' })
  updateBooking(@CurrentUser() user: {id: string}, @Body() dto: UpdateBookingDto, @Param('code') code: string) {
    return this.bookingsService.updateBooking(user.id, code, dto);
  }
}
