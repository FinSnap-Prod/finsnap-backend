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
import { CategoryService } from './category.service';

import {
  ApiCommonErrorResponses,
  ApiCommonErrorResponsesWithNotFound,
  ApiCategoryParams,
  ApiGetCategoriesSummaryResponse,
  ApiCreateCategory,
  ApiDeleteCategoryResponse,
  ApiUpdateCategory,
} from 'src/common/swagger';

import {
  CreateCategoryParamDto,
  CreateCategoryRequestDto,
  CreateCategoryResponseDto,
  DeleteCategoryParamDto,
  DeleteCategoryResponseDto,
  GetCategoriesSummaryParamDto,
  GetCategoriesSummaryQueryDto,
  GetCategoriesSummaryResponseDto,
  UpdateCategoryParamDto,
  UpdateCategoryRequestDto,
  UpdateCategoryResponseDto,
} from '../dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { User } from 'src/modules/auth/decorators/user.decorator';

@Controller('portfolios/:portfolio_id/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get(':category_id')
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

  @Post()
  @ApiOperation({ summary: '카테고리 생성' })
  @ApiCategoryParams()
  @ApiCreateCategory()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async createCategory(
    @Param() createCategoryParamDto: CreateCategoryParamDto,
    @Body() createCategoryRequestDto: CreateCategoryRequestDto,
    @User() user: any,
  ): Promise<CreateCategoryResponseDto> {
    return await this.categoryService.createCategory(
      user.id,
      Number(createCategoryParamDto.portfolio_id),
      createCategoryRequestDto.name,
    );
  }

  @Delete(':category_id')
  @ApiOperation({ summary: '카테고리 삭제' })
  @ApiCategoryParams()
  @ApiDeleteCategoryResponse()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async deleteCategory(
    @Param() deleteCategoryParamDto: DeleteCategoryParamDto,
    @User() user: any,
  ): Promise<DeleteCategoryResponseDto> {
    return await this.categoryService.deleteCategory(
      user.id,
      Number(deleteCategoryParamDto.portfolio_id),
      Number(deleteCategoryParamDto.category_id),
    );
  }

  @Put(':category_id')
  @ApiOperation({ summary: '카테고리 수정' })
  @ApiCategoryParams()
  @ApiUpdateCategory()
  @ApiCommonErrorResponsesWithNotFound()
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @Param() updateCategoryParamDto: UpdateCategoryParamDto,
    @Body() updateCategoryRequestDto: UpdateCategoryRequestDto,
    @User() user: any,
  ): Promise<UpdateCategoryResponseDto> {
    return await this.categoryService.updateCategory(
      user.id,
      Number(updateCategoryParamDto.portfolio_id),
      Number(updateCategoryParamDto.category_id),
      updateCategoryRequestDto.name,
    );
  }
}
