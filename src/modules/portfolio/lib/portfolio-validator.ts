import { Injectable } from '@nestjs/common';
import { Asset } from 'src/database/entities/asset/asset.entity';
import { Category } from 'src/database/entities/portfolio/category.entity';
import { Portfolio } from 'src/database/entities/portfolio/portfolio.entity';
import { UserAsset } from 'src/database/entities/portfolio/user-asset.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PortfolioValidator {
  constructor(private dataSource: DataSource) {}

  async validatePortfolioAndFindUserAsset(
    portfolioId: number,
    categoryId: number,
    assetId: number,
    userId: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // 1. 포트폴리오 소유권 검증
      const portfolio = await manager.findOne(Portfolio, {
        where: { id: portfolioId, user_id: userId },
      });

      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      // 2. 카테고리 소유권 검증
      const category = await manager.findOne(Category, {
        where: { id: categoryId, portfolio_id: portfolioId },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      // 3. 자산 존재 여부
      const asset = await manager.findOne(Asset, {
        where: { id: assetId },
      });

      if (!asset) {
        throw new Error('Asset not found');
      }

      // 4. UserAsset 존재 여부
      const userAsset = await manager.findOne(UserAsset, {
        where: {
          asset_id: assetId,
          category_id: categoryId,
        },
      });

      return {
        portfolio,
        category,
        asset,
        userAsset,
      };
    });
  }
}
