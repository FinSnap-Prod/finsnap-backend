import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PortfolioRepository } from './portfolio.repository';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';

@Injectable()
export class PortfolioService {
  constructor(private readonly portfolioRepository: PortfolioRepository) {}

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
}
