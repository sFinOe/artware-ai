import {
  Controller,
  Post,
  UseGuards,
  HttpStatus,
  HttpCode,
  Req,
  Get,
} from '@nestjs/common';
import { IpHandlingService } from './ip-handling.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller({
  path: 'ip-handling',
  version: '1',
})
export class IpHandlingController {
  constructor(private readonly ipHandlingService: IpHandlingService) {}

  @Post('save-ip')
  @HttpCode(HttpStatus.CREATED)
  async saveIp(@Req() req: Request) {
    const ipv4: string = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    return await this.ipHandlingService.saveIp(ipv4);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('set-payed')
  @HttpCode(HttpStatus.CREATED)
  async setPayed(@Req() req: Request) {
    const ipv4: string = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return await this.ipHandlingService.setPayed(ipv4);
  }

  @Post('is-payed')
  @HttpCode(HttpStatus.OK)
  async myIpExists(@Req() req: Request) {
    const ipv4: string = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return await this.ipHandlingService.isPayed(ipv4);
  }

  @Get('get-totalGenerations')
  @HttpCode(HttpStatus.OK)
  async getTotalGenerations(@Req() req: Request) {
    const ipv4: string = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return await this.ipHandlingService.getTotalGenerations(ipv4);
  }
}
