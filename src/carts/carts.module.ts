import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CartsRepository } from './carts.repository';
import { AuthModule } from 'src/auth/auth.module';
import { DiscountsModule } from 'src/discounts/discounts.module';

@Module({
  imports: [PrismaModule, AuthModule, DiscountsModule],
  controllers: [CartsController],
  providers: [CartsService, CartsRepository],
  exports: [CartsRepository]
})
export class CartsModule {}
