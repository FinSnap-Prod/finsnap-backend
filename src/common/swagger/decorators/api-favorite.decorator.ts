import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { GetFavoriteFoldersResponseDto } from '../../../modules/favorite/dto/responses/folder/get-favorite-folders.dto';
import { CreateFavoriteFolderResponseDto } from '../../../modules/favorite/dto/responses/folder/create-favorite-folder.dto';
import { DeleteFavoriteFolderResponseDto } from '../../../modules/favorite/dto/responses/folder/delete-favorite-folder.dto';
import { UpdateFavoriteFolderResponseDto } from '../../../modules/favorite/dto/responses/folder/update-favorite-folders.dto';
import { GetFavoriteAssetsResponseDto } from '../../../modules/favorite/dto/responses/asset/get-favorite-assets.dto';
import { CreateFavoriteAssetResponseDto } from '../../../modules/favorite/dto/responses/asset/create-favorite-assets.dto';
import { DeleteFavoriteAssetResponseDto } from '../../../modules/favorite/dto/responses/asset/delete-favorite-assets.dto';
import { UpdateFavoriteAssetResponseDto } from '../../../modules/favorite/dto/responses/asset/update-favorite-assets.dto';

// Favorite Parameter Decorators
/**
 * 관심종목 폴더 ID 파라미터
 */
export function ApiFavoriteFolderParam() {
  return applyDecorators(
    ApiParam({
      name: 'favorite_id',
      description: '관심종목 폴더 ID',
      example: 11,
    }),
  );
}

/**
 * 관심종목 자산 파라미터들 (폴더 ID + 자산 ID)
 */
export function ApiFavoriteAssetParams() {
  return applyDecorators(
    ApiParam({
      name: 'favorite_id',
      description: '관심종목 폴더 ID',
      example: 11,
    }),
    ApiParam({
      name: 'item_id',
      description: '관심종목 자산 ID',
      example: 2132,
    }),
  );
}

// Favorite Response Decorators
/**
 * 관심종목 폴더 목록 조회 응답
 */
export function ApiGetFavoriteFoldersResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Favorite Folders retrieved successfully.',
      type: GetFavoriteFoldersResponseDto,
    }),
  );
}

/**
 * 관심종목 폴더 생성 응답
 */
export function ApiCreateFavoriteFolderResponse() {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: 'Favorite folder created successfully.',
      type: CreateFavoriteFolderResponseDto,
    }),
  );
}

/**
 * 관심종목 폴더 삭제 응답
 */
export function ApiDeleteFavoriteFolderResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Favorite folder deleted successfully.',
      type: DeleteFavoriteFolderResponseDto,
    }),
  );
}

/**
 * 관심종목 폴더 수정 응답
 */
export function ApiUpdateFavoriteFolderResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Favorite folder updated successfully.',
      type: UpdateFavoriteFolderResponseDto,
    }),
  );
}

/**
 * 관심종목 자산 목록 조회 응답
 */
export function ApiGetFavoriteAssetsResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Favorite Assets retrieved successfully.',
      type: GetFavoriteAssetsResponseDto,
    }),
  );
}

/**
 * 관심종목 자산 추가 응답
 */
export function ApiCreateFavoriteAssetResponse() {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: 'Asset added to favorite folder successfully.',
      type: CreateFavoriteAssetResponseDto,
    }),
  );
}

/**
 * 관심종목 자산 삭제 응답
 */
export function ApiDeleteFavoriteAssetResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Asset removed from favorite folder successfully.',
      type: DeleteFavoriteAssetResponseDto,
    }),
  );
}

/**
 * 관심종목 자산 수정 응답
 */
export function ApiUpdateFavoriteAsset() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Favorite asset updated successfully.',
      type: UpdateFavoriteAssetResponseDto,
    }),
  );
}
