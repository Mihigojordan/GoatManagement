import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { json, urlencoded } from 'express';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Serve barcodes statically
  app.use('/barcode', express.static(join(__dirname, '..', 'public/barcodes')));

  app.use(cookieParser());
  app.use('/webhook', bodyParser.raw({ type: 'application/json' }));
  app.use(json());
  app.use(urlencoded({ extended: true }));

  // Enable CORS for dev and prod
  const allowedOrigins = [
    'http://localhost:5173',       // Development
    'https://api.abyride.com',      // Production
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
