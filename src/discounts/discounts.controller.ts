import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RolesGuard } from 'src/auth/roles-guard';
import { Roles } from 'src/auth/roles-decorator';
import { CreateDiscountDto } from './dto/create-discount.dto.ts';
import { UpdateBookingDto } from 'src/bookings/dto/update-booking.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}
  @Get()
  getAllDiscounts(@CurrentUser() user: {id: string}) {
    
  }

  @Get(':id')
  getDiscountDetails(@Param('id') id: string, @CurrentUser() user: {id: string}) {

  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  createDiscount(@CurrentUser() user: {id:string}, @Body() dto: CreateDiscountDto) {

  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  updateDiscounts(@CurrentUser() user: {id: string}, @Param('id') id: string, @Body() dto: UpdateDiscountDto) {

  }

  

}
