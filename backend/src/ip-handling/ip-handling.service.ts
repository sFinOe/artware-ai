import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IpHandlingService {
  constructor(private readonly prismaService: PrismaService) {}

  async saveIp(ip: string) {
    try {
      const ipExists = await this.prismaService.ip.findUnique({
        where: {
          ip,
        },
      });

      if (ipExists) {
        // throw new HttpException(
        //   'Ip address already exists.',
        //   HttpStatus.CONFLICT,
        // );
        return ipExists;
      }

      return await this.prismaService.ip.create({
        data: {
          ip,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Something went wrong while saving your IP address.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async isPayed(ip: string) {
    try {
      let ret: boolean;
      const ipExists = await this.prismaService.ip.findUnique({
        where: {
          ip,
        },
        select: {
          payed: true,
        },
      });

      if (ipExists.payed) {
        ret = true;
      } else {
        ret = false;
      }

      return { ip, ret };
    } catch (error) {
      throw new HttpException('Something went wrong.', HttpStatus.BAD_REQUEST);
    }
  }

  async setPayed(ip: string) {
    try {
      return await this.prismaService.ip.update({
        where: {
          ip,
        },
        data: {
          payed: true,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Something went wrong while setting your IP address to payed.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getTotalGenerations(ip: string) {
    try {
      return await this.prismaService.ip.findUnique({
        where: {
          ip,
        },
        select: {
          totalgenerations: true,
          hitlimit: true,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Something went wrong while getting total generations.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
