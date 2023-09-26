import {
  Body,
  Controller,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Patch,
  Delete,
  SerializeOptions,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InferenceService } from './inference.service';

@ApiTags('Inference')
@Controller({
  path: 'inference',
  version: '1',
})
export class InferenceController {
  constructor(private readonly inferenceService: InferenceService) {}

  @Post('generate')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async generate(@Body() body: any) {
    return this.inferenceService.generate(body);
  }

  @Post('free-generate')
  @HttpCode(HttpStatus.OK)
  async freeGenerate(@Req() req: Request, @Body() body: any) {
    const ipv4: string = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return this.inferenceService.freeGenerate(ipv4, body);
  }
}
