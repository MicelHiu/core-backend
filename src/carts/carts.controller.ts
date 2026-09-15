import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { RolesGuard } from 'src/auth/roles-guard';
import { Roles } from 'src/auth/roles-decorator';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('carts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Get all carts (admin only)' })
  getAdminCarts(@CurrentUser() user: {id: string}) {
    return this.cartsService.getAdminCarts();
  }

  @Get('current')
  @ApiOperation({ summary: "Get the current user's carts" })
  getAllCarts(@CurrentUser() user: {id: string}) {
    return this.cartsService.getAllCarts(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cart by id' })
  @ApiParam({ name: 'id', description: 'Cart id' })
  getCartById(@CurrentUser() user: {id: string}, @Param('id') id: string) {
    return this.cartsService.getCartById(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new cart item' })
  createCart(@CurrentUser() user: {id: string}, @Body() dto: CreateCartDto) {
    return this.cartsService.createCart(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a cart item' })
  @ApiParam({ name: 'id', description: 'Cart id' })
  updateCarts(@Param('id') id: string, @CurrentUser() user: {id: string}, @Body() dto: UpdateCartDto) {
    return this.cartsService.updateCart(dto, id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cart item' })
  @ApiParam({ name: 'id', description: 'Cart id' })
  deleteCart(@Param('id') id: string, @CurrentUser() user: {id: string}) {
    return this.cartsService.deleteCart(id, user.id);
  }
}
