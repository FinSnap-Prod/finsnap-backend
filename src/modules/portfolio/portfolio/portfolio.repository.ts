import { Injectable } from '@nestjs/common';
import { Portfolio } from 'src/database/entities/portfolio/portfolio.entity';
import { User } from 'src/database/entities/user/user.entity';
import { DataSource, In } from 'typeorm';
import { UpdatePortfolioItemDto } from '../dto';

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
}
