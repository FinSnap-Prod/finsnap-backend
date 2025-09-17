import { Injectable } from '@nestjs/common';
import { CashTransaction } from 'src/database/entities/account/cash-transaction.entity';
import { Asset } from 'src/database/entities/asset/asset.entity';
import { Institution } from 'src/database/entities/code/institution.entity';
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

  async validatePortfolioAndFindUserAssetForCash(
    portfolioId: number,
    institutionId: number,
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

      // 2. 기관 소유권 검증
      const institution = await manager.findOne(Institution, {
        where: { id: institutionId },
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      return {
        portfolio,
        institution,
      };
    });
  }

  async validatePortfolioForCash(portfolioId: number, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      // 1. 포트폴리오 소유권 검증
      const portfolio = await manager.findOne(Portfolio, {
        where: { id: portfolioId, user_id: userId },
      });

      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      return {
        portfolio,
      };
    });
  }

  async validatePortfolioForCashTransaction(
    portfolioId: number,
    institutionId: number,
    transactionId: number,
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

      // 2. 기관 소유권 검증
      const institution = await manager.findOne(Institution, {
        where: { id: institutionId },
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      // 3. 예수금 내역 소유권 검증
      const cashTransaction = await manager.findOne(CashTransaction, {
        where: { id: transactionId },
      });

      if (!cashTransaction) {
        throw new Error('Cash transaction not found');
      }

      return {
        portfolio,
        institution,
        cashTransaction,
      };
    });
  }
}
