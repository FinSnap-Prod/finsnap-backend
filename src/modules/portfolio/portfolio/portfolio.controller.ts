import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
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
  ApiCategoryParams,
  ApiAssetParams,
  ApiHistoryParams,
  ApiGetAllPortfolioResponse,
  ApiCreatePortfolio,
  ApiDeletePortfolioResponse,
  ApiUpdatePortfolio,
  ApiGetPortfolioSummaryResponse,
  ApiGetCategoriesSummaryResponse,
  ApiCreateCategory,
  ApiDeleteCategoryResponse,
  ApiUpdateCategory,
  ApiCreateAssetHistory,
  ApiDeleteAssetResponse,
  ApiGetAssetHistoryResponse,
  ApiDeleteAssetHistoryResponse,
  ApiUpdateAssetHistory,
} from 'src/common/swagger';

import {
  CreateAssetHistoryParamDto,
  CreateAssetHistoryRequestDto,
  CreateAssetHistoryResponseDto,
  CreateCategoryParamDto,
  CreateCategoryRequestDto,
  CreateCategoryResponseDto,
  CreatePortfolioRequestDto,
  CreatePortfolioResponseDto,
  DeleteAssetHistoryParamsDto,
  DeleteAssetHistoryResponseDto,
  DeleteAssetParamDto,
  DeleteAssetResponseDto,
  DeleteCategoryParamDto,
  DeleteCategoryResponseDto,
  DeletePortfolioParamDto,
  DeletePortfolioResponseDto,
  GetAllPortfolioResponseDto,
  GetAssetHistoryParamDto,
  GetAssetHistoryQueryDto,
  GetAssetHistoryResponseDto,
  GetCategoriesSummaryParamDto,
  GetCategoriesSummaryQueryDto,
  GetCategoriesSummaryResponseDto,
  GetPortfolioSummaryParamDto,
  GetPortfolioSummaryResponseDto,
  UpdateAssetHistoryParamsDto,
  UpdateAssetHistoryRequestDto,
  UpdateAssetHistoryResponseDto,
  UpdateCategoryParamDto,
  UpdateCategoryRequestDto,
  UpdateCategoryResponseDto,
  UpdatePortfolioParamDto,
  UpdatePortfolioRequestDto,
  UpdatePortfolioResponseDto,
} from '../dto';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { User } from 'src/modules/auth/decorators/user.decorator';

@ApiTags('portfolio')
@ApiBearerAuth()
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: '포트폴리오 조회' })
  @ApiGetAllPortfolioResponse()
  @ApiCommonErrorResponses()
  async getAllPortfolio(): Promise<GetAllPortfolioResponseDto> {
    const mockData: GetAllPortfolioResponseDto = {
      success: true,
      message: 'Portfolios retrieved successfully.',
      data: [
        {
          portfolio_id: 1,
          name: '배당주 투자',
          total_eval_amount: 12500000,
          total_profit_loss: 250000,
          total_profit_rate: 0.02,
          sort_order: 1,
        },
        {
          portfolio_id: 2,
          name: '해외 성장주',
          total_eval_amount: 6700000,
          total_profit_loss: -300000,
          total_profit_rate: -0.045,
          sort_order: 2,
        },
      ],
    };

    return mockData;
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
  async deletePortfolio(
    @Param() deletePortfolioParamDto: DeletePortfolioParamDto,
  ): Promise<DeletePortfolioResponseDto> {
    const mockData: DeletePortfolioResponseDto = {
      success: true,
      message: 'Portfolio deleted successfully.',
    };
    return mockData;
  }

  @Put(':portfolio_id')
  @ApiOperation({ summary: '포트폴리오 수정' })
  @ApiPortfolioParam()
  @ApiUpdatePortfolio()
  @ApiCommonErrorResponses()
  async updatePortfolio(
    @Param() updatePortfolioParamDto: UpdatePortfolioParamDto,
    @Body() updatePortfolioRequestDto: UpdatePortfolioRequestDto,
  ): Promise<UpdatePortfolioResponseDto> {
    const mockData: UpdatePortfolioResponseDto = {
      success: true,
      message: 'Portfolio updated successfully.',
      data: [
        {
          portfolio_id: 1,
          name: '배당주 투자',
          total_eval_amount: 12500000,
          total_profit_loss: 250000,
          total_profit_rate: 0.02,
          sort_order: 1,
        },
      ],
    };
    return mockData;
  }

  @Get(':portfolio_id')
  @ApiOperation({ summary: '포트폴리오 요약정보 조회' })
  @ApiPortfolioParam()
  @ApiGetPortfolioSummaryResponse()
  @ApiCommonErrorResponsesWithNotFound()
  async getPortfolioSummary(
    @Param() getPortfolioSummaryParamDto: GetPortfolioSummaryParamDto,
  ): Promise<GetPortfolioSummaryResponseDto> {
    const mockData: GetPortfolioSummaryResponseDto = {
      success: true,
      message: 'Portfolio summary retrieved successfully.',
      data: {
        portfolio_id: 1,
        portfolio_name: '배당주 투자',
        total_eval_amount: 12500000,
        total_profit_loss: 250000,
        total_rate: 0.02,
        created_at: '2021-01-01',
        updated_at: '2021-01-01',
        assets: [
          {
            asset_id: 1,
            asset_name: '삼성전자',
            eval_amount: 12500000,
            weighting: 0.02,
          },
        ],
        categories: [
          {
            category_id: 1,
            category_name: '주식',
            eval_amount: 12500000,
            weighting: 0.02,
          },
        ],
      },
    };
    return mockData;
  }

  @Get(':portfolio_id/categories/:category_id')
  @ApiOperation({ summary: '카테고리별 평가자산 조회' })
  @ApiCategoryParams()
  @ApiQuery({
    name: 'sortBy',
    description: '정렬 기준',
    example: 'name',
    type: GetCategoriesSummaryQueryDto,
  })
  @ApiQuery({
    name: 'order',
    description: '정렬 순서',
    example: 'asc',
    type: GetCategoriesSummaryQueryDto,
  })
  @ApiGetCategoriesSummaryResponse()
  @ApiCommonErrorResponsesWithNotFound()
  async getCategorySummary(
    @Param() getCategoriesSummaryParamDto: GetCategoriesSummaryParamDto,
    @Query() getCategoriesSummaryQueryDto: GetCategoriesSummaryQueryDto,
  ): Promise<GetCategoriesSummaryResponseDto> {
    const mockData: GetCategoriesSummaryResponseDto = {
      success: true,
      message: 'Portfolio assets retrieved successfully.',
      data: {
        portfolio_id: 1,
        portfolio_name: '승수의 장기투자',
        created_at: '2024-03-02T00:00:00Z',
        updated_at: '2025-07-02T00:00:00Z',
        sorted_by: 'price',
        categories: [{ category_id: 21, category_name: '예수금' }],
        assets: [
          {
            asset_id: 23,
            category_id: 22,
            category_name: '국내주식',
            asset_name: '삼성전자',
            current_price: 60500,
            avg_price: 60000,
            quantity: 20,
            purchase_amount: 1200000,
            eval_amount: 1210000,
            profit_amount: 10000,
            profit_rate: 0.1,
          },
        ],
      },
    };
    return mockData;
  }

  @Post(':portfolio_id/categories/:category_id')
  @ApiOperation({ summary: '카테고리 생성' })
  @ApiCategoryParams()
  @ApiCreateCategory()
  @ApiCommonErrorResponses()
  async createCategory(
    @Param() createCategoryParamDto: CreateCategoryParamDto,
    @Body() createCategoryRequestDto: CreateCategoryRequestDto,
  ): Promise<CreateCategoryResponseDto> {
    const mockData: CreateCategoryResponseDto = {
      success: true,
      message: 'Category created successfully.',
      data: {
        category_id: 21,
        portfolio_id: 1,
        category_name: '국내주식',
        created_at: '2025-07-02T10:30:00Z',
        updated_at: '2025-07-02T10:30:00Z',
      },
    };
    return mockData;
  }

  @Delete(':portfolio_id/categories/:category_id')
  @ApiOperation({ summary: '카테고리 삭제' })
  @ApiCategoryParams()
  @ApiDeleteCategoryResponse()
  @ApiCommonErrorResponses()
  async deleteCategory(
    @Param() deleteCategoryParamDto: DeleteCategoryParamDto,
  ): Promise<DeleteCategoryResponseDto> {
    const mockData: DeleteCategoryResponseDto = {
      success: true,
      message: 'Category deleted successfully.',
    };
    return mockData;
  }

  @Put(':portfolio_id/categories/:category_id')
  @ApiOperation({ summary: '카테고리 수정' })
  @ApiCategoryParams()
  @ApiUpdateCategory()
  @ApiCommonErrorResponsesWithNotFound()
  async updateCategory(
    @Param() updateCategoryParamDto: UpdateCategoryParamDto,
    @Body() updateCategoryRequestDto: UpdateCategoryRequestDto,
  ): Promise<UpdateCategoryResponseDto> {
    const mockData: UpdateCategoryResponseDto = {
      success: true,
      message: 'Category updated successfully.',
      data: {
        category_id: 23,
        portfolio_id: 1,
        name: '수정된 카테고리명',
        updated_at: '2025-07-03T12:15:45.000Z',
      },
    };
    return mockData;
  }

  @Post(':portfolio_id/categories/:category_id/assets')
  @ApiOperation({ summary: '자산 추가 및 거래내역 추가' })
  @ApiCategoryParams()
  @ApiCreateAssetHistory()
  @ApiCommonErrorResponses()
  async createAssetHistory(
    @Param() createAssetHistoryParamDto: CreateAssetHistoryParamDto,
    @Body() createAssetHistoryRequestDto: CreateAssetHistoryRequestDto,
  ): Promise<CreateAssetHistoryResponseDto> {
    const mockData: CreateAssetHistoryResponseDto = {
      success: true,
      message: 'Asset added successfully.',
      data: {
        asset_id: 10,
        category_id: 1,
        institution_id: 2,
        currency_code: 'KRW',
        type: 'sell',
        price: 23000,
        quantity: 10,
        memo: '7월 매수',
        created_at: 'YYYY-MM-DD HH:MM:SS',
      },
    };
    return mockData;
  }

  @Delete(':portfolio_id/categories/:category_id/assets/:asset_id')
  @ApiOperation({ summary: '자산 삭제' })
  @ApiAssetParams()
  @ApiDeleteAssetResponse()
  @ApiCommonErrorResponsesWithNotFound()
  async deleteAsset(
    @Param() deleteAssetParamDto: DeleteAssetParamDto,
  ): Promise<DeleteAssetResponseDto> {
    const mockData: DeleteAssetResponseDto = {
      success: true,
      message: 'Asset deleted successfully.',
      data: {
        asset_id: 102,
        deleted_at: '2025-07-03T13:10:45.000Z',
      },
    };
    return mockData;
  }

  @Get(':portfolio_id/categories/:category_id/assets/:asset_id/histories')
  @ApiOperation({ summary: '종목 거래내역 조회' })
  @ApiHistoryParams()
  @ApiQuery({
    name: 'order',
    description: '정렬 순서',
    example: 'desc',
    type: GetAssetHistoryQueryDto,
  })
  @ApiGetAssetHistoryResponse()
  @ApiCommonErrorResponsesWithNotFound()
  async getAssetHistory(
    @Param() getAssetHistoryParamDto: GetAssetHistoryParamDto,
    @Query() getAssetHistoryQueryDto: GetAssetHistoryQueryDto,
  ): Promise<GetAssetHistoryResponseDto> {
    const mockData: GetAssetHistoryResponseDto = {
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
        asset_name: '삼성전자',
        histories: [
          {
            asset_history_id: 558,
            type: 'buy',
            quantity: 10,
            price: 74000,
            total: 740000,
            recorded_at: '2025-01-04',
            memo: undefined,
          },
          {
            asset_history_id: 557,
            type: 'sell',
            quantity: 20,
            price: 73000,
            total: 1460000,
            recorded_at: '2025-01-04',
            memo: '분할매수',
          },
        ],
      },
    };
    return mockData;
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
