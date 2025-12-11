import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // DEBUG: Log environment variables on startup
  console.log('=== Environment Variables Check ===');
  console.log('DATABASE_HOST:', process.env.DATABASE_HOST || 'NOT SET');
  console.log('DATABASE_PORT:', process.env.DATABASE_PORT || 'NOT SET');
  console.log('DATABASE_USER:', process.env.DATABASE_USER || 'NOT SET');
  console.log('DATABASE_NAME:', process.env.DATABASE_NAME || 'NOT SET');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***SET***' : 'NOT SET');
  console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || 'NOT SET');
  console.log('PORT:', process.env.PORT || '3001 (default)');
  console.log('===================================');

  // Enable CORS - Allow requests from frontend
  // LOCAL: http://localhost:3000 (development)
  // PRODUCTION: https://fullstack-shop-frontend.onrender.com
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://fullstack-shop-frontend.onrender.com',
    ],
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Fullstack Shop API')
    .setDescription('REST API for the fullstack online shop application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error('Application failed to start', err);
  process.exit(1);
});
