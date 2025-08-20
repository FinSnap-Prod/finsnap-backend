import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { FavoriteFolderService } from './favorite-folder.service';
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
import { JwtAuthGuard } from '../auth/guards';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoriteFolderController {
  constructor(private readonly favoriteFolderService: FavoriteFolderService) {}

  @Get()
  @ApiOperation({ summary: '관심종목 폴더 목록 조회' })
  @ApiGetFavoriteFoldersResponse()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async getFavoriteFolders(
    @User() user: any,
  ): Promise<GetFavoriteFoldersResponseDto> {
    return await this.favoriteFolderService.getFavoriteFolders(user.id);
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
