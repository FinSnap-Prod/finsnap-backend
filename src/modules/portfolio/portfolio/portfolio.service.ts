import { Injectable } from '@nestjs/common';
import { PortfolioRepository } from './portfolio.repository';
import { UpdatePortfolioItemDto } from '../dto';

@Injectable()
export class PortfolioService {
  constructor(private readonly portfolioRepository: PortfolioRepository) {}

  async getAllPortfolio(userId: string) {
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
  }

  async createPortfolio(userId: string, name: string) {
    const portfolio =
      await this.portfolioRepository.executeCreatePortfolioTransaction(
        userId,
        name,
      );

    if (!portfolio) {
      throw new Error('Failed to create portfolio');
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
  }

  async deletePortfolio(portfolioId: number, userId: string) {
    await this.portfolioRepository.executeDeletePortfolioTransaction(
      portfolioId,
      userId,
    );

    return {
      success: true,
      message: 'Portfolio deleted successfully.',
    };
  }

  async updatePortfolio(portfolios: UpdatePortfolioItemDto[], userId: string) {
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
  }

  async getPortfolioSummary(portfolioId: number, userId: string) {
    const portfolioSummary =
      await this.portfolioRepository.executeGetPortfolioSummary(
        portfolioId,
        userId,
      );

    return {
      success: true,
      message: 'Portfolio summary retrieved successfully.',
      data: portfolioSummary,
    };
  }
}
