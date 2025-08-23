import { Module } from '@nestjs/common';
import { EtfService } from './etf.service';
import { EtfController } from './etf.controller';
import { EtfRepository } from './etf.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtfInfo } from 'src/database/entities/etf/etf-info.entity';
import { EtfMarketData } from 'src/database/entities/etf/etf-market-data.entity';
import { EtfPriceHistory } from 'src/database/entities/etf/etf-price-history.entity';
import { EtfComponent } from 'src/database/entities/etf/etf-component.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EtfInfo,
      EtfMarketData,
      EtfPriceHistory,
      EtfComponent,
    ]),
  ],
  controllers: [EtfController],
  providers: [EtfService, EtfRepository],
  exports: [EtfRepository],
})
export class EtfModule {}
