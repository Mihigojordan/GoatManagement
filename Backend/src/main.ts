import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);


  // Allow large request body size (e.g., for file uploads)
  app.use(json({ limit: '150mb' }));
  app.use(urlencoded({ limit: '150mb', extended: true }));


  // Cookie support
  app.use(cookieParser());


  // Log incoming requests (optional but useful for debugging)
  app.use((req, res, next) => {
    console.log('--- Incoming Request ---');
    console.log('Origin:', req.headers.origin);
    console.log('Method:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('Headers:', req.headers);
    next();
  });


  // Serve uploaded files (e.g., images) from "/uploads"
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });


  // Allowlist of allowed frontend origins
  const allowedOrigins = [
    'http://localhost:5173',
    'https://ishimwefarm.com',
    'https://www.ishimwefarm.com',
  ];


  // CORS setup
app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new globalThis.Error(`Not allowed by CORS: ${origin}`));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});



  await app.listen(process.env.PORT ?? 5000);
}


bootstrap();



