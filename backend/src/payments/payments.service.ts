import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly prismaService: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }

  async create(ip: string, body: any) {
    try {
      const { amount, currency } = body;

      const ipExists = await this.prismaService.ip.findUnique({
        where: {
          ip,
        },
        select: {
          payed: true,
        },
      });

      if (!ipExists) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Ip address does not exist',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        (ipExists.payed && amount != process.env.SUBSEQUENT_TIMES_PRICING) ||
        (!ipExists.payed && amount != process.env.FIRST_TIME_PRICING)
      ) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Invalid amount',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100,
        currency: currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return { clientSecret: paymentIntent.client_secret };
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
