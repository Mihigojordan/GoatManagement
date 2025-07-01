import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(json({ limit: '150mb' }));
  app.use(urlencoded({ limit: '150mb', extended: true }));

  // app.use((req, res, next) => {
  //   console.log('--- Incoming Request ---');
  //   console.log('Origin:', req.headers.origin);
  //   console.log('Method:', req.method);
  //   console.log('URL:', req.originalUrl);
  //   next();
  // });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const allowedOrigins = [
    'http://localhost:5173',
    'https://ishimwefarm.com',
    'https://www.ishimwefarm.com',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // No more credentials needed
  });

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
