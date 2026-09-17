import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActivityLogsRepository } from './activity-logs.repository';

@Module({
  imports: [PrismaModule],
  providers: [ActivityLogsRepository],
  exports: [ActivityLogsRepository],
})
export class ActivityLogsModule {}
