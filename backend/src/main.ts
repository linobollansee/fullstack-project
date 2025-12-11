import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
