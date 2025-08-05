import { Controller, Get, Query } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetCryptosQueryDto, GetCryptosResponseDto } from './dto';
import {
  ApiBadRequestAndNotFoundResponses,
  ApiGetCryptosResponse,
} from 'src/common/swagger';

@ApiTags('investment')
@Controller('cryptos')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get()
  @ApiOperation({
    summary: '암호화폐 목록 조회/검색',
  })
  @ApiGetCryptosResponse()
  @ApiBadRequestAndNotFoundResponses()
  async getCryptos(
    @Query() query: GetCryptosQueryDto,
  ): Promise<GetCryptosResponseDto> {
    const {
      q,
      market,
      page = 1,
      limit = 20,
      sortBy = 'name',
      order = 'asc',
    } = query;

    const mockCryptos = [
      {
        crypto_id: 1,
        eng_name: 'Bitcoin',
        kor_name: '비트코인',
        ticker: 'BTC',
        markets: [
          {
            market: 'Binance',
            currency_code: 'USDT',
            price: 30200,
            change_price: 300,
            change_rate: 1.01,
            acc_trade_volume: 1250000,
            acc_trade_price: 37750000000,
            market_cap: 590000000000,
            updated_at: '2024-01-15T09:30:00Z',
          },
          {
            market: 'Upbit',
            currency_code: 'KRW',
            price: 40200000,
            change_price: 400000,
            change_rate: 1.01,
            acc_trade_volume: 850000,
            acc_trade_price: 34170000000000,
            market_cap: 590000000000,
            updated_at: '2024-01-15T09:30:00Z',
          },
        ],
      },
      {
        crypto_id: 2,
        eng_name: 'Ethereum',
        kor_name: '이더리움',
        ticker: 'ETH',
        markets: [
          {
            market: 'Binance',
            currency_code: 'USDT',
            price: 1850,
            change_price: -25,
            change_rate: -1.33,
            acc_trade_volume: 850000,
            acc_trade_price: 15725000000,
            market_cap: 222000000000,
            updated_at: '2024-01-15T09:30:00Z',
          },
        ],
      },
    ];

    return {
      success: true,
      message: 'Crypto search results retrieved successfully.',
      data: {
        items: mockCryptos,
        sortBy,
        order,
        total_count: 0,
        page,
        limit,
      },
    };
  }
}
