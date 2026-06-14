import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  let keyPath = '/secrets/key.pem';
  let certPath = '/secrets/cert.pem';

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    keyPath = path.join(process.cwd(), 'secrets', 'key.pem');
    certPath = path.join(process.cwd(), 'secrets', 'cert.pem');
  }

  const httpsOptions =
    fs.existsSync(keyPath) && fs.existsSync(certPath)
      ? {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        }
      : undefined;

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    ...(httpsOptions ? { httpsOptions } : {}),
  });

  // 1. Enable Helmet secure headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: [
            "'self'",
            'data:',
            'https://res.cloudinary.com',
            'https://s3.amazonaws.com',
          ],
          connectSrc: [
            "'self'",
            'https://api.stripe.com',
            'https://api.razorpay.com',
          ],
          frameSrc: ["'self'", 'https://js.stripe.com'],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-site' },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.match(/^https?:\/\/([a-z0-9-]+)\.school\.com(:\d+)?$/i)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('School Management System API')
    .setDescription('The School Management System API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger is running on: http://localhost:${port}/api/docs`);
}
bootstrap();
