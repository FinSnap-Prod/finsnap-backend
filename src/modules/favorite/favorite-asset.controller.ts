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
import { FavoriteService } from './favorite.service';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  GetFavoriteAssetsParamDto,
  GetFavoriteAssetsQueryDto,
  GetFavoriteAssetsResponseDto,
  CreateFavoriteAssetParamDto,
  CreateFavoriteAssetBodyDto,
  CreateFavoriteAssetResponseDto,
  DeleteFavoriteAssetParamDto,
  DeleteFavoriteAssetResponseDto,
  UpdateFavoriteAssetBodyDto,
  UpdateFavoriteAssetParamsDto,
  UpdateFavoriteAssetResponseDto,
} from './dto';
import {
  ApiCommonErrorResponsesWithNotFound,
  ApiFavoriteFolderParam,
  ApiFavoriteAssetParams,
  ApiGetFavoriteAssetsResponse,
  ApiCreateFavoriteAssetResponse,
  ApiDeleteFavoriteAssetResponse,
  ApiUpdateFavoriteAsset,
} from 'src/common/swagger';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites/:favorite_id/items')
export class FavoriteAssetController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  @ApiOperation({ summary: '관심종목 자산 목록 조회' })
  @ApiFavoriteFolderParam()
  @ApiQuery({
    name: 'sortBy',
    description: '정렬 기준',
    required: false,
    enum: ['name', 'price'],
  })
  @ApiQuery({
    name: 'order',
    description: '정렬 차순',
    required: false,
    enum: ['desc', 'asc'],
  })
  @ApiGetFavoriteAssetsResponse()
  @ApiCommonErrorResponsesWithNotFound()
  async getFavoriteAssets(
    @Param() getFavoriteAssetsParamDto: GetFavoriteAssetsParamDto,
    @Query() getFavoriteAssetsQueryDto: GetFavoriteAssetsQueryDto,
  ): Promise<GetFavoriteAssetsResponseDto> {
    const { favorite_id } = getFavoriteAssetsParamDto;
    const { sortBy = 'name', order = 'asc' } = getFavoriteAssetsQueryDto;

    // 임시 목업 데이터
    const mockAssets = [
      {
        favorite_asset_id: 101,
        asset_type: 'stock',
        info_id: 321,
        info: {
          ticker: '005930',
          name: '삼성전자',
          market: 'KOSPI',
          price: 73500,
          change_price: -200,
          change_rate: -0.27,
        },
      },
      {
        favorite_asset_id: 102,
        asset_type: 'crypto',
        info_id: 555,
        info: {
          ticker: 'BTC',
          name: 'Bitcoin',
          market: 'Binance',
          price: 30200,
          change_price: 300,
          change_rate: 1.01,
        },
      },
    ];

    return {
      success: true,
      message: 'Favorite Assets retrieved successfully.',
      data: mockAssets,
    };
  }

  @Post()
  @ApiOperation({ summary: '관심종목 자산 추가' })
  @ApiFavoriteFolderParam()
  @ApiCreateFavoriteAssetResponse()
  @ApiCommonErrorResponsesWithNotFound()
  async createFavoriteAsset(
    @Param() createFavoriteAssetParamDto: CreateFavoriteAssetParamDto,
    @Body() createFavoriteAssetBodyDto: CreateFavoriteAssetBodyDto,
  ): Promise<CreateFavoriteAssetResponseDto> {
    const { favorite_id } = createFavoriteAssetParamDto;
    const { asset_type, info_id } = createFavoriteAssetBodyDto;

    // 임시 목업 데이터
    const createdAsset = {
      favorite_asset_id: 102,
      asset_type: asset_type,
      info_id: info_id,
      sort_order: 2,
      info: {
        ticker: 'BTC',
        name: 'Bitcoin',
        market: 'Binance',
        price: 30200,
        change_price: 300,
        change_rate: 1.01,
      },
    };

    return {
      success: true,
      message: 'Asset added to favorite folder successfully.',
      data: createdAsset,
    };
  }

  @Delete(':item_id')
  @ApiOperation({ summary: '관심종목 자산 삭제' })
  @ApiFavoriteAssetParams()
  @ApiDeleteFavoriteAssetResponse()
  @ApiCommonErrorResponsesWithNotFound()
  async deleteFavoriteAsset(
    @Param() deleteFavoriteAssetParamDto: DeleteFavoriteAssetParamDto,
  ): Promise<DeleteFavoriteAssetResponseDto> {
    return {
      success: true,
      message: 'Asset removed from favorite folder successfully.',
    };
  }

  @Put()
  @ApiOperation({ summary: '관심종목 편집 (정렬)' })
  @ApiFavoriteFolderParam()
  @ApiUpdateFavoriteAsset()
  @ApiCommonErrorResponsesWithNotFound()
  async updateFavoriteAsset(
    @Param() updateFavoriteAssetParamDto: UpdateFavoriteAssetParamsDto,
    @Body() updateFavoriteAssetBodyDto: UpdateFavoriteAssetBodyDto,
  ): Promise<UpdateFavoriteAssetResponseDto> {
    return {
      success: true,
      message: 'Favorite assets order updated successfully.',
      data: updateFavoriteAssetBodyDto.favoriteAssets,
    };
  }
}
