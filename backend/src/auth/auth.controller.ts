import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseGuards,
  Patch,
  Delete,
  SerializeOptions,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign')
  @HttpCode(HttpStatus.OK)
  async sign(@Body() body: any) {
    return this.authService.sign(body);
  }

  @Post('sign_paypal')
  @HttpCode(HttpStatus.OK)
  async sign_paypal(@Body() body: any) {
    return this.authService.sign_paypal(body);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async me(@Request() req: any) {
    return this.authService.me(req.user);
  }
}
