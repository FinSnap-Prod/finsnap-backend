import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './config/typeorm.config';
import { StockInfo } from './database/entities/stock/stock-info.entity';
import { EtfInfo } from './database/entities/etf/etf-info.entity';
import { SeederModule } from './database/seeder/seeder.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { InvestmentModule } from './modules/investment/investment.module';
import { UserModule } from './modules/user/user.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    TypeOrmModule.forFeature([StockInfo, EtfInfo]),
    SeederModule,
    FavoriteModule,
    InvestmentModule,
    AuthModule,
    PortfolioModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
