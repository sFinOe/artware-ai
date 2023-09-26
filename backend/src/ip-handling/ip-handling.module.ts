import { Global, Module } from '@nestjs/common';
import { IpHandlingService } from './ip-handling.service';
import { IpHandlingController } from './ip-handling.controller';

@Global()
@Module({
  providers: [IpHandlingService],
  controllers: [IpHandlingController],
  exports: [IpHandlingService],
})
export class IpHandlingModule {}
