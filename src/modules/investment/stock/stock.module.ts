import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StockRepository } from './stock.repository';
import { StockInfo } from 'src/database/entities/stock/stock-info.entity';
import { StockMarketData } from 'src/database/entities/stock/stock-market-data.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockPriceHistory } from 'src/database/entities/stock/stock-price-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockInfo, StockMarketData, StockPriceHistory]),
  ],
  controllers: [StockController],
  providers: [StockService, StockRepository],
  exports: [StockRepository],
})
export class StockModule {}
