import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PortfolioRepository } from './portfolio.repository';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';
import { DeletePortfolioParamDto, UpdatePortfolioItemDto } from '../dto';

@Injectable()
export class PortfolioService {
  constructor(private readonly portfolioRepository: PortfolioRepository) {}

  async getAllPortfolio(userId: string) {
    try {
      const portfolios =
        await this.portfolioRepository.executeFindAllPortfolio(userId);

      return {
        success: true,
        message: 'Portfolios retrieved successfully.',
        data: portfolios.map((portfolio) => ({
          portfolio_id: portfolio.id,
          name: portfolio.name,
          total_eval_amount: portfolio.total_eval_amount,
          total_profit_loss: portfolio.total_profit_loss,
          total_profit_rate: portfolio.total_rate,
          sort_order: portfolio.sort_order,
        })),
      };
    } catch (error) {
      if (error.message === 'User not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('User not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        ErrorResponseUtil.internalServerError(error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPortfolio(userId: string, name: string) {
    try {
      const portfolio =
        await this.portfolioRepository.executeCreatePortfolioTransaction(
          userId,
          name,
        );

      if (!portfolio) {
        throw new HttpException(
          ErrorResponseUtil.internalServerError('Failed to create portfolio'),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        success: true,
        message: 'Portfolio created successfully.',
        data: {
          portfolio_id: portfolio.id,
          name: portfolio.name,
          total_eval_amount: 0,
          total_profit_loss: 0,
          total_profit_rate: 0,
          sort_order: portfolio.sort_order,
        },
      };
    } catch (error) {
      if (error.message === 'Portfolio name already exists') {
        throw new HttpException(
          ErrorResponseUtil.badRequest('Portfolio name already exists'),
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        ErrorResponseUtil.internalServerError(error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePortfolio(portfolioId: number, userId: string) {
    try {
      await this.portfolioRepository.executeDeletePortfolioTransaction(
        portfolioId,
        userId,
      );

      return {
        success: true,
        message: 'Portfolio deleted successfully.',
      };
    } catch (error) {
      if (error.message === 'Portfolio not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('Portfolio not found'),
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
        ErrorResponseUtil.internalServerError(error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePortfolio(portfolios: UpdatePortfolioItemDto[], userId: string) {
    try {
      const updatedPortfolios =
        await this.portfolioRepository.executeUpdatePortfolioTransaction(
          portfolios,
          userId,
        );

      return {
        success: true,
        message: 'Portfolio updated successfully.',
        data: updatedPortfolios.map((portfolio) => ({
          portfolio_id: portfolio.id,
          name: portfolio.name,
          total_eval_amount: portfolio.total_eval_amount,
          total_profit_loss: portfolio.total_profit_loss,
          total_profit_rate: portfolio.total_rate,
          sort_order: portfolio.sort_order,
        })),
      };
    } catch (error) {
      if (error.message === 'Portfolio not found') {
        throw new HttpException(
          ErrorResponseUtil.notFound('Portfolio not found'),
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        ErrorResponseUtil.internalServerError(error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
