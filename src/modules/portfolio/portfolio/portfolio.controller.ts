import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiCommonErrorResponses,
  ApiCommonErrorResponsesWithNotFound,
  ApiPortfolioParam,
  ApiHistoryParams,
  ApiGetAllPortfolioResponse,
  ApiCreatePortfolio,
  ApiDeletePortfolioResponse,
  ApiUpdatePortfolio,
  ApiGetPortfolioSummaryResponse,
  ApiGetAssetHistoryResponse,
  ApiDeleteAssetHistoryResponse,
  ApiUpdateAssetHistory,
} from 'src/common/swagger';

import {
  CreatePortfolioRequestDto,
  CreatePortfolioResponseDto,
  DeleteAssetHistoryParamsDto,
  DeleteAssetHistoryResponseDto,
  DeletePortfolioParamDto,
  DeletePortfolioResponseDto,
  GetAllPortfolioResponseDto,
  GetAssetHistoryParamDto,
  GetAssetHistoryQueryDto,
  GetAssetHistoryResponseDto,
  GetPortfolioSummaryParamDto,
  GetPortfolioSummaryResponseDto,
  UpdateAssetHistoryParamsDto,
  UpdateAssetHistoryRequestDto,
  UpdateAssetHistoryResponseDto,
  UpdatePortfolioRequestDto,
  UpdatePortfolioResponseDto,
} from '../dto';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { User } from 'src/modules/auth/decorators/user.decorator';

@ApiTags('portfolios')
@ApiBearerAuth()
@Controller('portfolios')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: '포트폴리오 조회' })
  @ApiGetAllPortfolioResponse()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async getAllPortfolio(
    @User() user: any,
  ): Promise<GetAllPortfolioResponseDto> {
    return await this.portfolioService.getAllPortfolio(user.id);
  }

  @Post()
  @ApiOperation({ summary: '포트폴리오 생성' })
  @ApiCreatePortfolio()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async createPortfolio(
    @Body() createPortfolioRequestDto: CreatePortfolioRequestDto,
    @User() user: any,
  ): Promise<CreatePortfolioResponseDto> {
    return await this.portfolioService.createPortfolio(
      user.id,
      createPortfolioRequestDto.name,
    );
  }

  @Delete(':portfolio_id')
  @ApiOperation({ summary: '포트폴리오 삭제' })
  @ApiPortfolioParam()
  @ApiDeletePortfolioResponse()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async deletePortfolio(
    @Param() deletePortfolioParamDto: DeletePortfolioParamDto,
    @User() user: any,
  ): Promise<DeletePortfolioResponseDto> {
    return await this.portfolioService.deletePortfolio(
      Number(deletePortfolioParamDto.portfolio_id),
      user.id,
    );
  }

  @Put()
  @ApiOperation({ summary: '포트폴리오 수정' })
  @ApiPortfolioParam()
  @ApiUpdatePortfolio()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async updatePortfolio(
    @Body() updatePortfolioRequestDto: UpdatePortfolioRequestDto,
    @User() user: any,
  ): Promise<UpdatePortfolioResponseDto> {
    return await this.portfolioService.updatePortfolio(
      updatePortfolioRequestDto.portfolios,
      user.id,
    );
  }

  @Get(':portfolio_id')
  @ApiOperation({ summary: '포트폴리오 요약정보 조회' })
  @ApiPortfolioParam()
  @ApiGetPortfolioSummaryResponse()
  @ApiCommonErrorResponsesWithNotFound()
  @UseGuards(JwtAuthGuard)
  async getPortfolioSummary(
    @Param() getPortfolioSummaryParamDto: GetPortfolioSummaryParamDto,
    @User() user: any,
  ): Promise<GetPortfolioSummaryResponseDto> {
    return await this.portfolioService.getPortfolioSummary(
      Number(getPortfolioSummaryParamDto.portfolio_id),
      user.id,
    );
  }

  @Delete(
    ':portfolio_id/categories/:category_id/assets/:asset_id/histories/:history_id',
  )
  @ApiOperation({ summary: '거래내역 삭제' })
  @ApiHistoryParams()
  @ApiDeleteAssetHistoryResponse()
  @ApiCommonErrorResponsesWithNotFound()
  async deleteAssetHistory(
    @Param() deleteAssetHistoryParamsDto: DeleteAssetHistoryParamsDto,
  ): Promise<DeleteAssetHistoryResponseDto> {
    const mockData: DeleteAssetHistoryResponseDto = {
      success: true,
      message: 'History deleted successfully.',
      data: {
        asset_history_id: 555,
        deleted_at: '2025-07-03T15:00:00.000Z',
      },
    };
    return mockData;
  }

  @Put(
    ':portfolio_id/categories/:category_id/assets/:asset_id/histories/:history_id',
  )
  @ApiOperation({ summary: '거래내역 수정' })
  @ApiHistoryParams()
  @ApiUpdateAssetHistory()
  @ApiCommonErrorResponsesWithNotFound()
  async updateAssetHistory(
    @Param() updateAssetHistoryParamsDto: UpdateAssetHistoryParamsDto,
    @Body() updateAssetHistoryRequestDto: UpdateAssetHistoryRequestDto,
  ): Promise<UpdateAssetHistoryResponseDto> {
    const mockData: UpdateAssetHistoryResponseDto = {
      success: true,
      message: 'Transaction histories retrieved successfully.',
      data: {
        currency_code: 'KRW',
        portfolio_id: 1,
        category_id: 3,
        category_name: '국내주식',
        institution_id: 1,
        institution_name: '키움증권',
        asset_id: 102,
        histories: {
          asset_history_id: 558,
          type: 'sell',
          quantity: 20,
          price: 12500,
          total: 250000,
          recorded_at: '2025-01-04',
          memo: undefined,
        },
      },
    };
    return mockData;
  }
}
