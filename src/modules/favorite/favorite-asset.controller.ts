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
import { FavoriteAssetService } from './favorite-asset.service';
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
import { JwtAuthGuard } from '../auth/guards';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites/:favorite_id')
export class FavoriteAssetController {
  constructor(private readonly favoriteAssetService: FavoriteAssetService) {}

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
  @UseGuards(JwtAuthGuard)
  async getFavoriteAssets(
    @Param() getFavoriteAssetsParamDto: GetFavoriteAssetsParamDto,
    @Query() getFavoriteAssetsQueryDto: GetFavoriteAssetsQueryDto,
    @User() user: any,
  ): Promise<GetFavoriteAssetsResponseDto> {
    return await this.favoriteAssetService.getFavoriteAssets(
      user.id,
      getFavoriteAssetsParamDto.favorite_id,
      getFavoriteAssetsQueryDto.sortBy || '',
      getFavoriteAssetsQueryDto.order || '',
    );
  }

  @Post('items')
  @ApiOperation({ summary: '관심종목 자산 추가' })
  @ApiFavoriteFolderParam()
  @ApiCreateFavoriteAssetResponse()
  @ApiCommonErrorResponsesWithNotFound()
  @UseGuards(JwtAuthGuard)
  async createFavoriteAsset(
    @Param() createFavoriteAssetParamDto: CreateFavoriteAssetParamDto,
    @Body() createFavoriteAssetBodyDto: CreateFavoriteAssetBodyDto,
    @User() user: any,
  ): Promise<CreateFavoriteAssetResponseDto> {
    return await this.favoriteAssetService.createFavoriteAsset(
      user.id,
      createFavoriteAssetParamDto.favorite_id,
      createFavoriteAssetBodyDto.asset_type,
      createFavoriteAssetBodyDto.info_id,
    );
  }

  @Delete('items/:favorite_asset_id')
  @ApiOperation({ summary: '관심종목 자산 삭제' })
  @ApiFavoriteAssetParams()
  @ApiDeleteFavoriteAssetResponse()
  @ApiCommonErrorResponsesWithNotFound()
  @UseGuards(JwtAuthGuard)
  async deleteFavoriteAsset(
    @Param() deleteFavoriteAssetParamDto: DeleteFavoriteAssetParamDto,
    @User() user: any,
  ): Promise<DeleteFavoriteAssetResponseDto> {
    return await this.favoriteAssetService.deleteFavoriteAsset(
      user.id,
      deleteFavoriteAssetParamDto.favorite_id,
      deleteFavoriteAssetParamDto.favorite_asset_id,
    );
  }

  @Put('items')
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
