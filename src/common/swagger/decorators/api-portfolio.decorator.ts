import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { GetAllPortfolioResponseDto } from '../../../modules/portfolio/dto/responses/portfolio/get-portfolios.dto';
import { CreatePortfolioRequestDto } from '../../../modules/portfolio/dto/requests/portfolio/create-portfolio.dto';
import { CreatePortfolioResponseDto } from '../../../modules/portfolio/dto/responses/portfolio/create-portfolio.dto';
import { DeletePortfolioResponseDto } from '../../../modules/portfolio/dto/responses/portfolio/delete-portfolio.dto';
import { UpdatePortfolioRequestDto } from '../../../modules/portfolio/dto/requests/portfolio/update-portfolio.dto';
import { UpdatePortfolioResponseDto } from '../../../modules/portfolio/dto/responses/portfolio/update-portfolio.dto';
import { GetPortfolioSummaryResponseDto } from '../../../modules/portfolio/dto/responses/portfolio/get-portfolio-summary.dto';
import { GetCategoriesSummaryResponseDto } from '../../../modules/portfolio/dto/responses/category/get-categories-summary.dto';
import { CreateCategoryRequestDto } from '../../../modules/portfolio/dto/requests/category/create-category.dto';
import { CreateCategoryResponseDto } from '../../../modules/portfolio/dto/responses/category/create-category.dto';
import { DeleteCategoryResponseDto } from '../../../modules/portfolio/dto/responses/category/delete-category.dto';
import { UpdateCategoryRequestDto } from '../../../modules/portfolio/dto/requests/category/update-category.dto';
import { UpdateCategoryResponseDto } from '../../../modules/portfolio/dto/responses/category/update-category.dto';
import { CreateAssetHistoryRequestDto } from '../../../modules/portfolio/dto/requests/asset/create-asset-history.dto';
import { CreateAssetHistoryResponseDto } from '../../../modules/portfolio/dto/responses/asset/create-asset-history.dto';
import { DeleteAssetResponseDto } from '../../../modules/portfolio/dto/responses/asset/delete-asset.dto';
import { GetAssetHistoryResponseDto } from '../../../modules/portfolio/dto/responses/asset/get-asset-history.dto';
import { DeleteAssetHistoryResponseDto } from '../../../modules/portfolio/dto/responses/asset/delete-asset-history.dto';
import { UpdateAssetHistoryRequestDto } from '../../../modules/portfolio/dto/requests/asset/update-asset-history.dto';
import { UpdateAssetHistoryResponseDto } from '../../../modules/portfolio/dto/responses/asset/update-asset-history.dto';

// Portfolio Parameter Decorators
/**
 * 포트폴리오 ID 파라미터
 */
export function ApiPortfolioParam() {
  return applyDecorators(
    ApiParam({
      name: 'portfolio_id',
      description: '포트폴리오 ID',
      example: 1,
    }),
  );
}

/**
 * 카테고리 파라미터들 (포트폴리오 ID + 카테고리 ID)
 */
export function ApiCategoryParams() {
  return applyDecorators(
    ApiParam({
      name: 'portfolio_id',
      description: '포트폴리오 ID',
      example: 1,
    }),
    ApiParam({
      name: 'category_id',
      description: '카테고리 ID',
      example: 1,
    }),
  );
}

/**
 * 자산 파라미터들 (포트폴리오 ID + 카테고리 ID + 자산 ID)
 */
export function ApiAssetParams() {
  return applyDecorators(
    ApiParam({
      name: 'portfolio_id',
      description: '포트폴리오 ID',
      example: 1,
    }),
    ApiParam({
      name: 'category_id',
      description: '카테고리 ID',
      example: 1,
    }),
    ApiParam({
      name: 'asset_id',
      description: '자산 ID',
      example: 1,
    }),
  );
}

/**
 * 거래내역 파라미터들 (포트폴리오 ID + 카테고리 ID + 자산 ID + 거래내역 ID)
 */
export function ApiHistoryParams() {
  return applyDecorators(
    ApiParam({
      name: 'portfolio_id',
      description: '포트폴리오 ID',
      example: 1,
    }),
    ApiParam({
      name: 'category_id',
      description: '카테고리 ID',
      example: 1,
    }),
    ApiParam({
      name: 'asset_id',
      description: '자산 ID',
      example: 1,
    }),
    ApiParam({
      name: 'history_id',
      description: '거래내역 ID',
      example: 1,
    }),
  );
}

// Portfolio Response Decorators
/**
 * 포트폴리오 목록 조회 응답
 */
export function ApiGetAllPortfolioResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Portfolio retrieved successfully.',
      type: GetAllPortfolioResponseDto,
    }),
  );
}

/**
 * 포트폴리오 생성 요청/응답
 */
export function ApiCreatePortfolio() {
  return applyDecorators(
    ApiBody({
      type: CreatePortfolioRequestDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Portfolio created successfully.',
      type: CreatePortfolioResponseDto,
    }),
  );
}

/**
 * 포트폴리오 삭제 응답
 */
export function ApiDeletePortfolioResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Portfolio deleted successfully.',
      type: DeletePortfolioResponseDto,
    }),
  );
}

/**
 * 포트폴리오 수정 요청/응답
 */
export function ApiUpdatePortfolio() {
  return applyDecorators(
    ApiBody({
      description: '포트폴리오 이름 및 정렬 수정',
      type: UpdatePortfolioRequestDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Portfolio updated successfully.',
      type: UpdatePortfolioResponseDto,
    }),
  );
}

/**
 * 포트폴리오 요약 조회 응답
 */
export function ApiGetPortfolioSummaryResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Portfolio summary retrieved successfully.',
      type: GetPortfolioSummaryResponseDto,
    }),
  );
}

/**
 * 카테고리 요약 조회 응답
 */
export function ApiGetCategoriesSummaryResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Categories summary retrieved successfully.',
      type: GetCategoriesSummaryResponseDto,
    }),
  );
}

/**
 * 카테고리 생성 요청/응답
 */
export function ApiCreateCategory() {
  return applyDecorators(
    ApiBody({
      description: '카테고리 생성',
      type: CreateCategoryRequestDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Category created successfully.',
      type: CreateCategoryResponseDto,
    }),
  );
}

/**
 * 카테고리 삭제 응답
 */
export function ApiDeleteCategoryResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Category deleted successfully.',
      type: DeleteCategoryResponseDto,
    }),
  );
}

/**
 * 카테고리 수정 요청/응답
 */
export function ApiUpdateCategory() {
  return applyDecorators(
    ApiBody({
      description: '카테고리 수정',
      type: UpdateCategoryRequestDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Category updated successfully.',
      type: UpdateCategoryResponseDto,
    }),
  );
}

/**
 * 자산 거래내역 생성 요청/응답
 */
export function ApiCreateAssetHistory() {
  return applyDecorators(
    ApiBody({
      description: '자산 거래내역 생성',
      type: CreateAssetHistoryRequestDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Asset history created successfully.',
      type: CreateAssetHistoryResponseDto,
    }),
  );
}

/**
 * 자산 삭제 응답
 */
export function ApiDeleteAssetResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Asset deleted successfully.',
      type: DeleteAssetResponseDto,
    }),
  );
}

/**
 * 자산 거래내역 조회 응답
 */
export function ApiGetAssetHistoryResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Asset history retrieved successfully.',
      type: GetAssetHistoryResponseDto,
    }),
  );
}

/**
 * 자산 거래내역 삭제 응답
 */
export function ApiDeleteAssetHistoryResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Asset history deleted successfully.',
      type: DeleteAssetHistoryResponseDto,
    }),
  );
}

/**
 * 자산 거래내역 수정 요청/응답
 */
export function ApiUpdateAssetHistory() {
  return applyDecorators(
    ApiBody({
      description: '자산 거래내역 수정',
      type: UpdateAssetHistoryRequestDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Asset history updated successfully.',
      type: UpdateAssetHistoryResponseDto,
    }),
  );
}
