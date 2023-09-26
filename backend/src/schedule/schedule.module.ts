import { Global, Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';

@Global()
@Module({
  controllers: [],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
