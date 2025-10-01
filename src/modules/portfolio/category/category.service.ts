import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import {
  GetCategoriesSummaryParamDto,
  GetCategoriesSummaryQueryDto,
} from '../dto';
import { PortfolioValidator } from '../lib/portfolio-validator';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly portfolioValidator: PortfolioValidator,
  ) {}

  async getCategoriesSummary(
    getCategoriesSummaryParamDto: GetCategoriesSummaryParamDto,
    getCategoriesSummaryQueryDto: GetCategoriesSummaryQueryDto,
    userId: string,
  ) {
    const getCategorySummary =
      await this.categoryRepository.executeGetCategoryTransaction(
        getCategoriesSummaryParamDto,
        getCategoriesSummaryQueryDto,
        userId,
      );
    return getCategorySummary;
  }

  async createCategory(userId: string, portfolioId: number, name: string) {
    const category =
      await this.categoryRepository.executeCreateCategoryTransaction(
        userId,
        portfolioId,
        name,
      );

    if (!category) {
      throw new Error('Failed to create category');
    }

    return {
      success: true,
      message: 'Category created successfully.',
      data: {
        category_id: category.id,
        portfolio_id: category.portfolio_id,
        category_name: category.name,
        created_at: category.created_at.toISOString().split('T')[0],
        updated_at: category.updated_at.toISOString().split('T')[0],
      },
    };
  }

  async deleteCategory(
    userId: string,
    portfolioId: number,
    categoryId: number,
  ) {
    await this.categoryRepository.executeDeleteCategoryTransaction(
      userId,
      portfolioId,
      categoryId,
    );

    return {
      success: true,
      message: 'Category deleted successfully.',
    };
  }

  async updateCategory(
    userId: string,
    portfolioId: number,
    categoryId: number,
    name: string,
  ) {
    const updatedCategory =
      await this.categoryRepository.executeUpdateCategoryTransaction(
        userId,
        portfolioId,
        categoryId,
        name,
      );

    if (!updatedCategory) {
      throw new Error('Failed to update category');
    }

    return {
      success: true,
      message: 'Category updated successfully.',
      data: {
        category_id: updatedCategory.id,
        portfolio_id: updatedCategory.portfolio_id,
        name: updatedCategory.name,
        created_at: updatedCategory.created_at.toISOString().split('T')[0],
        updated_at: updatedCategory.updated_at.toISOString().split('T')[0],
      },
    };
  }
}
