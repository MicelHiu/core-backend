import { Module } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { DiscountsRepository } from './discounts.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DiscountsController],
  providers: [DiscountsService, DiscountsRepository],
  exports:[DiscountsRepository],
})
export class DiscountsModule {}
