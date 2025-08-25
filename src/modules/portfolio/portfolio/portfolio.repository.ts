import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Portfolio } from 'src/database/entities/portfolio/portfolio.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PortfolioRepository {
  constructor(
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
    private dataSource: DataSource,
  ) {}

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
