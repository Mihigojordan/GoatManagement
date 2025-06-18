import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import * as bodyParser from 'body-parser';
import { json, urlencoded } from 'express';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Serve barcodes folder statically under /barcodes
  app.use('/barcode', express.static(join(__dirname, '..', 'public/barcodes')));

  app.use(cookieParser());
  
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
    // Increase payload size limit for JSON and URL-encoded bodies
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  await app.listen(process.env.PORT ?? 3000);
  
}
bootstrap();
