import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RolesGuard } from 'src/auth/roles-guard';
import { Roles } from 'src/auth/roles-decorator';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}
  @Get()
  @ApiOperation({ summary: 'Get all discounts' })
  getAllDiscounts(@CurrentUser() user: {id: string}) {
    return this.discountsService.getAllDiscounts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get discount details by id' })
  @ApiParam({ name: 'id', description: 'Discount id' })
  getDiscountDetails(@Param('id') id: string, @CurrentUser() user: {id: string}) {
    return this.discountsService.getDiscountDetails(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create a new discount (admin only)' })
  createDiscount(@Body() dto: CreateDiscountDto) {
    return this.discountsService.createDiscount(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a discount (admin can update any field, other roles limited)' })
  @ApiParam({ name: 'id', description: 'Discount id' })
  updateDiscounts(@CurrentUser() user: {id: string, role: string}, @Param('id') id: string, @Body() dto: UpdateDiscountDto) {
    const isAdmin = user.role === 'admin';
    return this.discountsService.updateDiscount(id, dto, isAdmin);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a discount (admin only)' })
  @ApiParam({ name: 'id', description: 'Discount id' })
  deleteDiscount(@CurrentUser() user: {id: string}, @Param('id') id: string) {
    return this.discountsService.deleteDiscount(id);
  }
}
