import { Controller, Get, Query } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetDepositsQueryDto, GetDepositsResponseDto } from './dto';
import {
  ApiBadRequestAndNotFoundResponses,
  ApiGetDepositsResponse,
} from 'src/common/swagger';

@ApiTags('investment')
@Controller('deposits')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Get()
  @ApiOperation({
    summary: '예적금 목록 조회/검색',
  })
  @ApiGetDepositsResponse()
  @ApiBadRequestAndNotFoundResponses()
  async getDeposits(
    @Query() query: GetDepositsQueryDto,
  ): Promise<GetDepositsResponseDto> {
    const {
      q,
      market,
      amount,
      period,
      page = 1,
      limit = 20,
      sortBy = 'name',
      order = 'asc',
    } = query;

    // 임시 목업 데이터
    const mockDeposits = [
      {
        deposit_id: 1,
        name: '행복통장',
        bank_name: '우리은행',
        bank_code: 'WOORI',
        interest_rate: 3.2,
        period: '12M',
        market_data: {
          product_code: 'WR123456',
          interest_type: '단리',
          max_prefer_rate: 3.8,
          report_month: '202507',
          updated_at: '2025-07-03T12:45:00Z',
        },
      },
      {
        deposit_id: 2,
        name: '스마트예금',
        bank_name: '신한은행',
        bank_code: 'SHINHAN',
        interest_rate: 3.5,
        period: '24M',
        market_data: {
          product_code: 'SH987654',
          interest_type: '복리',
          max_prefer_rate: 4.1,
          report_month: '202507',
          updated_at: '2025-07-03T12:45:00Z',
        },
      },
    ];

    return {
      success: true,
      message: 'Deposit Filter search results retrieved successfully.',
      data: {
        items: mockDeposits,
        sortBy,
        order,
        total_count: 150,
        page,
        limit,
      },
    };
  }
}
