import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentModule } from '../investment/investment.module';

// Portfolio 관련 엔티티들
import { Portfolio } from 'src/database/entities/portfolio/portfolio.entity';
import { Category } from 'src/database/entities/portfolio/category.entity';
import { UserAsset } from 'src/database/entities/portfolio/user-asset.entity';
import { AssetHistory } from 'src/database/entities/portfolio/asset-history.entity';

// Portfolio 관련 Controller들
import { PortfolioController } from './portfolio/portfolio.controller';
import { CategoryController } from './category/category.controller';
import { AssetController } from './asset/asset.controller';
import { AssetHistoryController } from './asset-history/asset-history.controller';

// Portfolio 관련 Service들
import { PortfolioService } from './portfolio/portfolio.service';
import { CategoryService } from './category/category.service';
import { AssetService } from './asset/asset.service';
import { AssetHistoryService } from './asset-history/asset-history.service';

// Portfolio 관련 Repository들
import { PortfolioRepository } from './portfolio/portfolio.repository';
import { CategoryRepository } from './category/category.repository';
import { AssetRepository } from './asset/asset.repository';
import { AssetHistoryRepository } from './asset-history/asset-history.repository';
import { User } from 'src/database/entities/user/user.entity';
import { StockInfo } from 'src/database/entities/stock/stock-info.entity';
import { CryptoInfo } from 'src/database/entities/crypto/crypto-info.entity';
import { EtfInfo } from 'src/database/entities/etf/etf-info.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Portfolio,
      Category,
      UserAsset,
      AssetHistory,
      User,
      StockInfo,
      CryptoInfo,
      EtfInfo,
    ]),
    InvestmentModule,
  ],
  controllers: [
    PortfolioController,
    CategoryController,
    AssetController,
    AssetHistoryController,
  ],
  providers: [
    PortfolioService,
    CategoryService,
    AssetService,
    AssetHistoryService,
    PortfolioRepository,
    CategoryRepository,
    AssetRepository,
    AssetHistoryRepository,
  ],
  exports: [
    PortfolioService,
    CategoryService,
    AssetService,
    AssetHistoryService,
  ],
})
export class PortfolioModule {}
