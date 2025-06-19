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
  app.use(cookieParser());
  app.use('/webhook', bodyParser.raw({ type: 'application/json' }));
  app.use(json());
  app.use(urlencoded({ extended: true }))
   app.enableCors({
    origin:'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  await app.listen(process.env.PORT ?? 3000);
  
}
bootstrap();
