import { Injectable } from '@nestjs/common';
import { Portfolio } from 'src/database/entities/portfolio/portfolio.entity';
import { User } from 'src/database/entities/user/user.entity';
import { DataSource } from 'typeorm';

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
}
