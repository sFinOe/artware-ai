import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import * as fs from 'fs';
// import * as express from 'express';

config();

const PORT = process.env.BACKEND_PORT || 3000;

async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync(process.env.SSL_KEY_PATH),
  //   cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  // };

  const app = (await NestFactory.create(AppModule)).setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.enableCors({
    origin: 'http://localhost',
    methods: '*',
    allowedHeaders: '*',
  });

  // const config = new DocumentBuilder()
  //   .setTitle('Cats example')
  //   .setDescription('The cats API description')
  //   .setVersion('1.0')
  //   .addTag('cats')
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('docs', app, document);

  await app.listen(PORT);
}
bootstrap();
