import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RolesGuard } from 'src/auth/roles-guard';
import { Roles } from 'src/auth/roles-decorator';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';

@UseGuards(JwtAuthGuard)
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}
  @Get()
  getAllDiscounts(@CurrentUser() user: {id: string}) {
    return this.discountsService.getAllDiscounts();
  }

  @Get(':id')
  getDiscountDetails(@Param('id') id: string, @CurrentUser() user: {id: string}) {
    return this.discountsService.getDiscountDetails(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  createDiscount(@Body() dto: CreateDiscountDto) {
    return this.discountsService.createDiscount(dto);
  }

  @Patch(':id')
  updateDiscounts(@CurrentUser() user: {id: string, role: string}, @Param('id') id: string, @Body() dto: UpdateDiscountDto) {
    const isAdmin = user.role === 'admin';
    return this.discountsService.updateDiscount(id, dto, isAdmin);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  deleteDiscount(@CurrentUser() user: {id: string}, @Param('id') id: string) {
    return this.discountsService.deleteDiscount(id);
  }
}
