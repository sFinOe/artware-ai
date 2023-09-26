import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3 } from 'aws-sdk';
import { IpHandlingService } from 'src/ip-handling/ip-handling.service';
import { ScheduleService } from 'src/schedule/schedule.service';

@Injectable()
export class InferenceService {
  private s3: S3;
  constructor(
    private prismaService: PrismaService,
    private ipHandlingService: IpHandlingService,
    private scheduleService: ScheduleService,
  ) {
    this.s3 = new S3({
      endpoint: process.env.R2_ENDPOINT,
      region: process.env.R2_REGION,
      signatureVersion: 'v4',
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
    });
  }

  async generate(body: any) {
    const input = body.input;
    const endpointId = body.endpointId;
    const s3Config = {
      accessId: process.env.ACCESS_KEY_ID,
      accessSecret: process.env.SECRET_ACCESS_KEY,
      endpointUrl: process.env.R2_ENDPOINT,
    };

    const payload = {
      input,
      s3Config,
    };

    const header = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
    };

    try {
      const response = await axios.post(
        `https://api.runpod.ai/v2/${endpointId}/runsync`,
        payload,
        header,
      );

      const filename = response.data.output.filenames[0];
      const key = filename + '.png';

      const params = {
        Bucket: process.env.R2_BUCKET,
        Key: key,
      };

      const Base64 = await this.s3.getObject(params).promise();
      const img = Base64.Body.toString('base64');
      const Base64Img = `data:image/png;base64,${img}`;

      await this.s3.deleteObject(params).promise();

      return { Image: Base64Img };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: "Couldn't generate the image",
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async freeGenerate(ip: string, body: any) {
    const input = body.input;
    const endpointId = body.endpointId;
    const s3Config = {
      accessId: process.env.ACCESS_KEY_ID,
      accessSecret: process.env.SECRET_ACCESS_KEY,
      endpointUrl: process.env.R2_ENDPOINT,
    };

    const payload = {
      input,
      s3Config,
    };

    const header = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
    };

    try {
      const userIp = await this.ipHandlingService.saveIp(ip);

      if (
        userIp.totalgenerations >=
        parseInt(process.env.FREE_GENERATIONS_PER_USER)
      ) {
        await this.prismaService.ip.update({
          where: {
            ip,
          },
          data: {
            hitlimit: true,
          },
        });

        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'You have exceeded the free generation limit',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      console.log(this.scheduleService.getTotalGenerationPerDay());
      console.log(process.env.TOTAL_FREE_GENERATIONS_PER_DAY);

      console.log(userIp.totalgenerations);
      console.log(process.env.FREE_GENERATIONS_PER_USER);

      if (
        this.scheduleService.getTotalGenerationPerDay() >=
        parseInt(process.env.TOTAL_FREE_GENERATIONS_PER_DAY)
      ) {

        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'You have exceeded Daily Free Generation Limit',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const response = await axios.post(
        `https://api.runpod.ai/v2/${endpointId}/runsync`,
        payload,
        header,
      );

      await this.scheduleService.incrementTotalGenerationPerDay();
      await this.scheduleService.incrementTotalGenerationPerDay();
      await this.prismaService.ip.update({
        where: {
          ip,
        },
        data: {
          totalgenerations: userIp.totalgenerations + 1,
        },
      });

      const filename = response.data.output.filenames[0];
      const key = filename + '.png';

      const params = {
        Bucket: process.env.R2_BUCKET,
        Key: key,
      };

      const Base64 = await this.s3.getObject(params).promise();
      const img = Base64.Body.toString('base64');
      const Base64Img = `data:image/png;base64,${img}`;

      await this.s3.deleteObject(params).promise();

      return { Image: Base64Img };
    } catch (error) {
      if (!error.response) {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: "Couldn't generate the image",
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (error.response.status === HttpStatus.UNAUTHORIZED) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'You have exceeded the free generation limit',
          },
          HttpStatus.UNAUTHORIZED,
        );
      } else if (error.response.status === HttpStatus.FORBIDDEN) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'You have exceeded Daily Free Generation Limit',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }
  }
}
