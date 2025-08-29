import { Injectable } from '@nestjs/common';
import { Category } from 'src/database/entities/portfolio/category.entity';
import { Portfolio } from 'src/database/entities/portfolio/portfolio.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class CategoryRepository {
  constructor(private dataSource: DataSource) {}

  async executeCreateCategoryTransaction(
    userId: string,
    portfolioId: number,
    name: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // 1. 포트폴리오 존재 여부 및 소유권 검증
      const existingPortfolio = await manager.findOne(Portfolio, {
        where: { id: portfolioId, user_id: userId },
      });

      if (!existingPortfolio) {
        throw new Error('Portfolio not found');
      }
      // 2. 카테고리 중복 조회
      const existingCategory = await manager.findOne(Category, {
        where: { name, portfolio_id: portfolioId },
      });

      if (existingCategory) {
        throw new Error('Category already exists');
      }

      // 3. 정렬 순서 최대값 조회
      const maxSortOrder = await manager.findOne(Category, {
        where: { portfolio_id: portfolioId },
        order: { sort_order: 'DESC' },
      });

      const newSortOrder = maxSortOrder ? maxSortOrder.sort_order + 1 : 1;

      // 4. 카테고리 생성
      const newCategory = await manager.save(Category, {
        name,
        portfolio_id: portfolioId,
        sort_order: newSortOrder,
      });

      // 5. 카테고리 생성 결과 반환
      const createdCategory = await manager.findOne(Category, {
        where: { id: newCategory.id },
      });

      return createdCategory;
    });
  }

  async executeDeleteCategoryTransaction(
    userId: string,
    portfolioId: number,
    categoryId: number,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // 1-1. 포트폴리오 존재 여부 및 소유권 검증
      const existingPortfolio = await manager.findOne(Portfolio, {
        where: { id: portfolioId, user_id: userId },
      });

      if (!existingPortfolio) {
        throw new Error('Portfolio not found');
      }

      // 1-2. 카테고리 존재 여부 및 소유권 검증
      const existingCategory = await manager.findOne(Category, {
        where: { id: categoryId, portfolio_id: portfolioId },
      });

      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // 2. 삭제 포트폴리오 정렬 번호 조회
      const deletedSortOrder = existingCategory.sort_order;

      // 3. 포트폴리오 삭제
      await manager.delete(Category, { id: categoryId });

      // 4. 정렬 순서 업데이트
      await manager
        .createQueryBuilder()
        .update(Category)
        .set({ sort_order: () => 'sort_order - 1' })
        .where(
          'portfolio_id = :portfolioId AND sort_order > :deletedSortOrder',
          {
            portfolioId,
            deletedSortOrder,
          },
        )
        .execute();
    });
  }

  async executeUpdateCategoryTransaction(
    userId: string,
    portfolioId: number,
    categoryId: number,
    name: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // 1-1. 포트폴리오 존재 여부 및 소유권 검증
      const existingPortfolio = await manager.findOne(Portfolio, {
        where: { id: portfolioId, user_id: userId },
      });

      if (!existingPortfolio) {
        throw new Error('Portfolio not found');
      }

      // 1-2. 카테고리 존재 여부 및 소유권 검증
      const existingCategory = await manager.findOne(Category, {
        where: { id: categoryId, portfolio_id: portfolioId },
      });

      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // 2. 카테고리 이름 중복 검증
      const existingCategoryWithSameName = await manager.findOne(Category, {
        where: { name, portfolio_id: portfolioId },
      });

      if (existingCategoryWithSameName) {
        throw new Error('Category name already exists');
      }

      // 3. 카테고리 이름 업데이트
      await manager
        .createQueryBuilder()
        .update(Category)
        .set({ name })
        .where('id = :id AND portfolio_id = :portfolioId', {
          id: categoryId,
          portfolioId,
        })
        .execute();

      // 4. 업데이트된 카테고리 조회
      const updatedCategory = await manager.findOne(Category, {
        where: { id: categoryId, portfolio_id: portfolioId },
      });

      return updatedCategory;
    });
  }
}
