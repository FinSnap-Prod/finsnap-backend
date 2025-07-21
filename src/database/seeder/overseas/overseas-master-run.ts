import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { OverseasMasterService } from './overseas-master.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(OverseasMasterService);
  await service.run();
  await app.close();
}

bootstrap();
