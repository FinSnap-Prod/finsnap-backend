import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.use(cookieParser());

  // 전역 API prefix 설정
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'Accept',
      'X-Requested-With',
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Cookie',
    ],
  });

  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
    } else {
      next();
    }
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Finsnap API')
    .setDescription('금융 포트폴리오 관리 API')
    .setVersion('1.0')
    .addTag('oauth', '인증 관련 API')
    .addTag('user', '사용자 관련 API')
    .addTag('portfolio', '포트폴리오 관련 API')
    .addTag('investment', '투자 관련 API')
    .addTag('favorites', '관심종목 관련 API')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
