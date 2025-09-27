import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { User } from 'src/modules/auth/decorators/user.decorator';

@Controller('portfolios/:portfolio_id/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/summary')
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
    @User() user: any,
  ): Promise<GetCategoriesSummaryResponseDto> {
    return await this.categoryService.getCategoriesSummary(
      getCategoriesSummaryParamDto,
      getCategoriesSummaryQueryDto,
      user.id,
    );
  }

  @Post()
  @ApiOperation({ summary: '카테고리 생성' })
  @ApiCategoryParams()
  @ApiCreateCategory()
  @ApiCommonErrorResponses()
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
