import { Injectable } from '@nestjs/common';
import { Portfolio } from 'src/database/entities/portfolio/portfolio.entity';
import { User } from 'src/database/entities/user/user.entity';
import { DataSource, In } from 'typeorm';
import { UpdatePortfolioItemDto } from '../dto';
import { Category } from 'src/database/entities/portfolio/category.entity';
import { UserAsset } from 'src/database/entities/portfolio/user-asset.entity';
import { Asset } from 'src/database/entities/asset/asset.entity';
import { StockInfo } from 'src/database/entities/stock/stock-info.entity';
import { CryptoInfo } from 'src/database/entities/crypto/crypto-info.entity';
import { EtfInfo } from 'src/database/entities/etf/etf-info.entity';

@Injectable()
export class PortfolioRepository {
  constructor(private dataSource: DataSource) {}

  async executeFindAllPortfolio(userId: string) {
    return this.dataSource.transaction(async (manager) => {
      // 1. 유저 조회
      const user = await manager.findOne(User, { where: { id: userId } });

      if (!user) {
        throw new Error('User not found');
      }

      // 2. 포트폴리오 조회
      const portfolios = await manager.find(Portfolio, {
        where: { user_id: userId },
        order: { sort_order: 'ASC' },
      });

      // 3. 반환
      return portfolios;
    });
  }

  async executeCreatePortfolioTransaction(userId: string, name: string) {
    return this.dataSource.transaction(async (manager) => {
      // 1. 포트폴리오 중복 조회
      const existingPortfolio = await manager.findOne(Portfolio, {
        where: { name, user_id: userId },
      });

      if (existingPortfolio) {
        throw new Error('Portfolio name already exists');
      }

      // 2. 정렬 순서 최대값 조회
      const maxSortOrder = await manager.findOne(Portfolio, {
        where: { user_id: userId },
        order: { sort_order: 'DESC' },
      });

      const newSortOrder = maxSortOrder ? maxSortOrder.sort_order + 1 : 1;

      // 3. 포트폴리오 생성
      const newPortfolio = await manager.save(Portfolio, {
        name,
        user_id: userId,
        sort_order: newSortOrder,
      });

      // 4. 생성된 포트폴리오 조회
      const createdPortfolio = await manager.findOne(Portfolio, {
        where: { id: newPortfolio.id },
      });

      // 5. 생성된 포트폴리오 리턴
      return createdPortfolio;
    });
  }

  async executeDeletePortfolioTransaction(
    portfolioId: number,
    userId: string,
  ): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      // 1. 포트폴리오 존재 및 소유자 여부 조회
      const existingPortfolio = await manager.findOne(Portfolio, {
        where: {
          id: portfolioId,
          user_id: userId,
        },
      });

      if (!existingPortfolio) {
        throw new Error('Portfolio not found');
      }

      // 2. 삭제 포트폴리오 정렬 번호 조회
      const deletedSortOrder = existingPortfolio.sort_order;

      // 3. 포트폴리오 삭제
      await manager.delete(Portfolio, { id: portfolioId });

      // 4. 정렬 순서 업데이트
      await manager
        .createQueryBuilder()
        .update(Portfolio)
        .set({
          sort_order: () => 'sort_order - 1',
        })
        .where('user_id = :userId AND sort_order > :deletedSortOrder', {
          userId,
          deletedSortOrder,
        })
        .execute();
    });
  }

  async executeUpdatePortfolioTransaction(
    portfolios: UpdatePortfolioItemDto[],
    userId: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // 1. 포트폴리오 존재 여부 및 소유자 여부 조회
      const portfolioIds = portfolios.map((portfolio) => portfolio.id);
      const existingPortfolios = await manager.find(Portfolio, {
        where: { id: In(portfolioIds), user_id: userId },
      });

      if (existingPortfolios.length !== portfolioIds.length) {
        throw new Error('Some portfolios not found or access denied');
      }

      // 2. 정렬 순서 중복 검증
      const sortOrderSet = portfolios.map((portfolio) => portfolio.sort_order);
      const uniqueSortOrders = new Set(sortOrderSet);

      if (uniqueSortOrders.size !== portfolios.length) {
        throw new Error('Sort order must be unique');
      }

      // 3. 포트폴리오 업데이트
      for (const portfolio of portfolios) {
        await manager
          .createQueryBuilder()
          .update(Portfolio)
          .set({
            name: portfolio.name,
            sort_order: portfolio.sort_order,
          })
          .where('id = :id AND user_id = :userId', {
            id: portfolio.id,
            userId,
          })
          .execute();
      }

      // 4. 목록 반환
      const updatedPortfolios = await manager.find(Portfolio, {
        where: { id: In(portfolioIds), user_id: userId },
        order: { sort_order: 'ASC' },
      });

      return updatedPortfolios;
    });
  }

  async executeGetPortfolioSummary(portfolioId: number, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      // 1. 포트폴리오 존재여부 및 소유자 여부 조회
      const existingPortfolio = await manager.findOne(Portfolio, {
        where: { id: portfolioId, user_id: userId },
      });

      if (!existingPortfolio) {
        throw new Error('Portfolio not found');
      }

      // 2. 포트폴리오 기본 정보 조회
      const portfolio = await manager.findOne(Portfolio, {
        where: { id: portfolioId, user_id: userId },
        select: [
          'id',
          'name',
          'total_eval_amount',
          'total_profit_loss',
          'total_rate',
          'created_at',
          'updated_at',
        ],
      });

      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      // 3. 카테고리 정보 조회
      const categories = await manager.find(Category, {
        where: { portfolio_id: portfolioId },
        select: ['id', 'name', 'sort_order'],
      });

      // 3-1. 카테고리가 없는 경우(포트폴리오 생성하고 바로 조회할 경우) 반환
      if (categories.length === 0) {
        return {
          portfolio_id: portfolio.id,
          portfolio_name: portfolio.name,
          total_eval_amount: Number(portfolio.total_eval_amount),
          total_profit_loss: Number(portfolio.total_profit_loss),
          total_rate: Number(portfolio.total_rate),
          created_at: portfolio.created_at.toISOString().split('T')[0],
          updated_at: portfolio.updated_at.toISOString().split('T')[0],
          assets: [],
          categories: [],
        };
      }

      // 4. 카테고리별 평가 자산 정보 조회
      const categoryIds = categories.map((category) => category.id);
      const assets = await manager.find(UserAsset, {
        where: { category_id: In(categoryIds) },
        select: ['id', 'asset_id', 'eval_amount', 'category_id'],
        relations: ['asset', 'asset.asset_type'],
      });

      // 5. 유저가 보유한 assetId로 Asset 정보 가져오기
      const assetsWithNames = await Promise.all(
        assets.map(async (userAsset) => {
          // Asset 정보 조회
          const assetInfo = await manager.findOne(Asset, {
            where: { id: userAsset.asset_id },
            relations: ['asset_type'],
          });

          if (!assetInfo) {
            throw new Error('Asset not found');
          }

          // asset_type에 따라 다른 테이블에서 이름 조회
          let assetName = '';

          // 5-1. 자산 타입에 따른 이름 조회
          switch (assetInfo.asset_type.name) {
            case 'stock':
              // StockInfo 테이블에서 이름 조회
              const stockInfo = await manager.findOne(StockInfo, {
                where: { id: assetInfo.asset_info_id },
                select: ['kor_name', 'eng_name'],
              });
              assetName = stockInfo
                ? stockInfo.kor_name || stockInfo.eng_name
                : 'Unknown Stock';
              break;

            case 'crypto':
              // CryptoInfo 테이블에서 이름 조회
              const cryptoInfo = await manager.findOne(CryptoInfo, {
                where: { id: assetInfo.asset_info_id },
                select: ['kor_name', 'eng_name'],
              });
              assetName = cryptoInfo
                ? cryptoInfo.kor_name || cryptoInfo.eng_name
                : 'Unknown Crypto';
              break;

            case 'etf':
              // EtfInfo 테이블에서 이름 조회
              const etfInfo = await manager.findOne(EtfInfo, {
                where: { id: assetInfo.asset_info_id },
                select: ['kor_name', 'eng_name'],
              });
              assetName = etfInfo
                ? etfInfo.kor_name || etfInfo.eng_name
                : 'Unknown ETF';
              break;

            default:
              assetName = 'Unknown Asset Type';
              break;
          }

          // 5-2. 유저가 보유한 assetId로 Asset 정보 가져오기
          return {
            ...userAsset,
            asset_name: assetName,
          };
        }),
      );

      // 6-1. 가중치 계산 함수 (string 타입 유지)
      const calculateWeighting = (amount: number, total: number): number => {
        return total > 0 ? Number((amount / total).toFixed(3)) : 0;
      };

      // 6-2. 자산별 가중치 계산
      const assetsWithWeighting = assetsWithNames.map((asset) => ({
        asset_id: asset.asset_id,
        asset_name: asset.asset_name,
        eval_amount: Number(asset.eval_amount),
        weighting: calculateWeighting(
          Number(asset.eval_amount),
          Number(portfolio.total_eval_amount),
        ),
      }));

      // 6-3. 카테고리별 가중치 계산
      const categoriesWithWeighting = categories.map((category) => {
        // 해당 카테고리에 속한 자산들의 총 평가금액 계산
        const categoryAssets = assetsWithNames.filter(
          (asset) => asset.category_id === category.id,
        );
        const categoryTotalEvalAmount = categoryAssets.reduce(
          (sum, asset) => sum + Number(asset.eval_amount),
          0,
        );

        return {
          category_id: category.id,
          category_name: category.name,
          eval_amount: categoryTotalEvalAmount,
          weighting: calculateWeighting(
            categoryTotalEvalAmount,
            Number(portfolio.total_eval_amount),
          ),
        };
      });

      // 3. 반환
      return {
        portfolio_id: portfolio.id,
        portfolio_name: portfolio.name,
        total_eval_amount: Number(portfolio.total_eval_amount),
        total_profit_loss: Number(portfolio.total_profit_loss),
        total_rate: Number(portfolio.total_rate),
        created_at: portfolio.created_at.toISOString().split('T')[0],
        updated_at: portfolio.updated_at.toISOString().split('T')[0],
        assets: assetsWithWeighting,
        categories: categoriesWithWeighting,
      };
    });
  }
}
