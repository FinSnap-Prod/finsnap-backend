import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(userId: string, portfolioId: number, name: string) {
    try {
      const category =
        await this.categoryRepository.executeCreateCategoryTransaction(
          userId,
          portfolioId,
          name,
        );

      if (!category) {
        throw new HttpException(
          ErrorResponseUtil.internalServerError('Failed to create category'),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
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
    } catch (error) {
      if (error.message === 'Portfolio not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('Portfolio not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Category already exists') {
        throw new HttpException(
          ErrorResponseUtil.badRequest('Category already exists'),
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        ErrorResponseUtil.internalServerError('Failed to create category'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteCategory(
    userId: string,
    portfolioId: number,
    categoryId: number,
  ) {
    try {
      await this.categoryRepository.executeDeleteCategoryTransaction(
        userId,
        portfolioId,
        categoryId,
      );

      return {
        success: true,
        message: 'Category deleted successfully.',
      };
    } catch (error) {
      if (error.message === 'Portfolio not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('Portfolio not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Category not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('Category not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.status === 400) {
        throw new HttpException(
          ErrorResponseUtil.badRequest(error.message),
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        ErrorResponseUtil.internalServerError('Failed to delete category'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateCategory(
    userId: string,
    portfolioId: number,
    categoryId: number,
    name: string,
  ) {
    try {
      const updatedCategory =
        await this.categoryRepository.executeUpdateCategoryTransaction(
          userId,
          portfolioId,
          categoryId,
          name,
        );

      if (!updatedCategory) {
        throw new HttpException(
          ErrorResponseUtil.internalServerError('Failed to update category'),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
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
    } catch (error) {
      if (error.message === 'Portfolio not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('Portfolio not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Category not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('Category not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.message === 'Category name already exists') {
        throw new HttpException(
          ErrorResponseUtil.badRequest('Category name already exists'),
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    throw new HttpException(
      ErrorResponseUtil.internalServerError('Failed to update category'),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
