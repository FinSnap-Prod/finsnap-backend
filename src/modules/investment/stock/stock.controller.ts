import { Controller, Get, Query } from '@nestjs/common';
import { StockService } from './stock.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetStocksQueryDto, GetStocksResponseDto } from './dto';
import {
  ApiBadRequestAndNotFoundResponses,
  ApiGetStocksResponse,
} from 'src/common/swagger';

@ApiTags('investment')
@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @ApiOperation({
    summary: '주식 목록 조회/검색',
  })
  @ApiGetStocksResponse()
  @ApiBadRequestAndNotFoundResponses()
  async getStocks(
    @Query() query: GetStocksQueryDto,
  ): Promise<GetStocksResponseDto> {
    const {
      q,
      market,
      page = 1,
      limit = 20,
      sortBy = 'name',
      order = 'asc',
    } = query;

    // 임시 목업 데이터
    const mockStocks = [
      {
        stock_id: 1,
        name: '삼성전자',
        ticker: '005930',
        market: 'KOSPI',
        currency_code: 'KRW',
        price: 73500,
        market_cap: 438000000000000,
        change_price: -200,
        change_rate: -0.27,
        updated_at: '2024-01-15T09:30:00Z',
        returns: {
          return1m: 5.2,
          return3m: 12.8,
          return6m: 18.5,
          return1y: 25.3,
          return3y: 45.7,
        },
        metrics: {
          per: 15.2,
          pbr: 1.8,
          eps: 4850,
          bps: 40800,
          roa: 8.5,
          roe: 12.3,
        },
      },
      {
        stock_id: 2,
        name: 'SK하이닉스',
        ticker: '000660',
        market: 'KOSPI',
        currency_code: 'KRW',
        price: 125000,
        market_cap: 91200000000000,
        change_price: 1500,
        change_rate: 1.21,
        updated_at: '2024-01-15T09:30:00Z',
        returns: {
          return1m: 8.7,
          return3m: 22.1,
          return6m: 35.8,
          return1y: 48.2,
          return3y: 67.5,
        },
        metrics: {
          per: 12.8,
          pbr: 2.1,
          eps: 9750,
          bps: 59500,
          roa: 11.2,
          roe: 16.8,
        },
      },
    ];

    return {
      success: true,
      message: 'Stocks retrieved successfully.',
      data: {
        items: mockStocks,
        sortBy,
        order,
        total_count: 150,
        page,
        limit,
      },
    };
  }
}
