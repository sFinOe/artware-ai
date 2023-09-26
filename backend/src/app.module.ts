import { Module } from '@nestjs/common';
import { InferenceModule } from './inference/inference.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { IpHandlingModule } from './ip-handling/ip-handling.module';
import { ScheduleModule as CustomScheduleModule } from 'src/schedule/schedule.module';
import { ScheduleService } from 'src/schedule/schedule.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    InferenceModule,
    AuthModule,
    PaymentsModule,
    PrismaModule,
    IpHandlingModule,
    ScheduleModule.forRoot(),
    CustomScheduleModule,
  ],
  controllers: [],
  providers: [ScheduleService],
})
export class AppModule {}
