import { Controller, Get, Query } from '@nestjs/common';
import { EtfService } from './etf.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetEtfsQueryDto, GetEtfsResponseDto } from './dto';
import {
  ApiBadRequestAndNotFoundResponses,
  ApiGetEtfsResponse,
} from 'src/common/swagger';

@ApiTags('investment')
@Controller('etfs')
export class EtfController {
  constructor(private readonly etfService: EtfService) {}

  @Get()
  @ApiOperation({
    summary: 'ETF 목록 조회/검색',
  })
  @ApiGetEtfsResponse()
  @ApiBadRequestAndNotFoundResponses()
  async getEtfs(@Query() query: GetEtfsQueryDto): Promise<GetEtfsResponseDto> {
    const {
      q,
      market,
      page = 1,
      limit = 20,
      sortBy = 'name',
      order = 'asc',
    } = query;

    const mockEtfs = [
      {
        etf_id: 1,
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
    ];

    return {
      success: true,
      message: 'ETF search results retrieved successfully.',
      data: {
        items: mockEtfs,
        sortBy,
        order,
        total_count: 0,
        page,
        limit,
      },
    };
  }
}
