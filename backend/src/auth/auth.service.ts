import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import axios from 'axios';
import exp from 'constants';
@Injectable()
export class AuthService {
  private stripe: Stripe;
  constructor(
    private readonly jwtService: JwtService,
    private prismaService: PrismaService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }

  async sign(body: AuthDto) {
    const {
      payment_intent,
      payment_intent_client_secret,
      redirect_status,
      expire_time,
    } = body;

    try {
      const Transaction = await this.prismaService.transaction.findUnique({
        where: {
          payment_intent: payment_intent,
        },
      });

      if (Transaction) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Payment already exists',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (redirect_status === 'succeeded') {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(
          payment_intent,
        );

        if (
          paymentIntent.status === 'succeeded' &&
          paymentIntent.client_secret === payment_intent_client_secret
        ) {
          const Transaction = await this.prismaService.transaction.create({
            data: {
              payment_intent: payment_intent,
              client_secret: payment_intent_client_secret,
              status: paymentIntent.status,
            },
          });

          if (!Transaction) {
            throw new HttpException(
              {
                status: HttpStatus.BAD_REQUEST,
                error: 'Payment not created',
              },
              HttpStatus.BAD_REQUEST,
            );
          }

          const Token = this.jwtService.sign(
            { payment_intent },
            { expiresIn: expire_time },
          );
          return { Token: Token };
        } else {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Payment not succeeded',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async me(user: any) {
    const { payment_intent } = user;

    try {
      const Transaction = await this.prismaService.transaction.findUnique({
        where: {
          payment_intent: payment_intent,
        },
      });

      if (!Transaction) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Payment not found',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return Transaction;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async sign_paypal(body: any) {
    const { paymentId, payerId, expireTime } = body;

    const paypalEndpoint = `${process.env.BASE_URL}/v2/checkout/orders`;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    try {
      const Transaction = await this.prismaService.transaction.findUnique({
        where: {
          payment_intent: paymentId,
        },
      });

      if (Transaction) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Payment already exists',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const response = await axios.get(`${paypalEndpoint}/${paymentId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: clientId,
          password: clientSecret,
        },
      });
      if (response.data.status === 'COMPLETED') {
        const Transaction = await this.prismaService.transaction.create({
          data: {
            payment_intent: response.data.id,
            client_secret: payerId,
            status: response.data.status,
          },
        });

        if (!Transaction) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Payment not created',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        const Token = this.jwtService.sign(
          { payment_intent: paymentId },
          { expiresIn: expireTime },
        );

        return { Token: Token };
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
