import { Module } from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { VisitorsController } from './visitors.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { VisitorsRepository } from './visitors.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [VisitorsController],
  providers: [VisitorsService, VisitorsRepository],
})
export class VisitorsModule {}
