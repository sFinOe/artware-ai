import { IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  readonly payment_intent: string;

  @IsString()
  readonly payment_intent_client_secret: string;

  @IsString()
  readonly redirect_status: string;
}
