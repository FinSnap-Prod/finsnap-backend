import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  GetFavoriteFoldersResponseDto,
  CreateFavoriteFolderResponseDto,
  CreateFavoriteFolderDto,
  DeleteFavoriteFolderParamDto,
  DeleteFavoriteFolderResponseDto,
  UpdateFavoriteFolderParamsDto,
  UpdateFavoriteFolderBodyDto,
  UpdateFavoriteFolderResponseDto,
} from './dto';
import {
  ApiCommonErrorResponses,
  ApiCommonErrorResponsesWithNotFound,
  ApiGetFavoriteFoldersResponse,
  ApiCreateFavoriteFolderResponse,
  ApiDeleteFavoriteFolderResponse,
  ApiUpdateFavoriteFolderResponse,
} from 'src/common/swagger';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoriteFolderController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  @ApiOperation({ summary: '관심종목 폴더 목록 조회' })
  @ApiGetFavoriteFoldersResponse()
  @ApiCommonErrorResponses()
  async getFavoriteFolders(): Promise<GetFavoriteFoldersResponseDto> {
    // 임시 목업 데이터
    const mockFavorites = [
      {
        favorite_id: 1,
        name: '배당주 투자',
        sort_order: 1,
      },
      {
        favorite_id: 2,
        name: '해외 성장주',
        sort_order: 2,
      },
    ];

    return {
      success: true,
      message: 'Favorite Folders retrieved successfully.',
      data: mockFavorites,
    };
  }

  @Post()
  @ApiOperation({ summary: '관심종목 폴더 생성' })
  @ApiCreateFavoriteFolderResponse()
  @ApiCommonErrorResponses()
  async createFavoriteFolder(
    @Body() createFavoriteFolderDto: CreateFavoriteFolderDto,
  ): Promise<CreateFavoriteFolderResponseDto> {
    // 임시 목업 데이터
    const createdFolder = {
      favorite_id: 1,
      name: createFavoriteFolderDto.name,
      sort_order: 1,
    };

    return {
      success: true,
      message: 'Favorite Folder created successfully.',
      data: createdFolder,
    };
  }

  @Delete(':favorite_id')
  @ApiOperation({ summary: '관심종목 폴더 삭제' })
  @ApiDeleteFavoriteFolderResponse()
  @ApiCommonErrorResponsesWithNotFound()
  async deleteFavoriteFolder(
    @Param() deleteFavoriteFolderParamDto: DeleteFavoriteFolderParamDto,
  ): Promise<DeleteFavoriteFolderResponseDto> {
    return {
      success: true,
      message: 'Favorite Folder deleted successfully.',
    };
  }

  @Put(':favorite_id')
  @ApiOperation({ summary: '관심종목 폴더 수정' })
  @ApiUpdateFavoriteFolderResponse()
  @ApiCommonErrorResponses()
  async updateFavoriteFolder(
    @Param() updateFavoriteFolderParamDto: UpdateFavoriteFolderParamsDto,
    @Body() updateFavoriteFolderBodyDto: UpdateFavoriteFolderBodyDto,
  ): Promise<UpdateFavoriteFolderResponseDto> {
    return {
      success: true,
      message: 'Favorite Folder updated successfully.',
      data: updateFavoriteFolderBodyDto,
    };
  }
}
