import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OauthModule } from './modules/oauth/oauth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './config/typeorm.config';
import { StockInfo } from './database/entities/stock/stock-info.entity';
import { EtfInfo } from './database/entities/etf/etf-info.entity';
import { SeederModule } from './database/seeder/seeder.module';

@Module({
  imports: [
    OauthModule,
    TypeOrmModule.forRoot(typeORMConfig),
    TypeOrmModule.forFeature([StockInfo, EtfInfo]),
    SeederModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
