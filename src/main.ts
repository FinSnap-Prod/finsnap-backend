import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // 전역 API prefix 설정
  app.setGlobalPrefix('api');

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
