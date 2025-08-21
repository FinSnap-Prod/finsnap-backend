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
  DeleteFavoriteFolderResponseDto,
  UpdateFavoriteFolderBodyDto,
  UpdateFavoriteFolderResponseDto,
  DeleteFavoriteFolderParamDto,
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
  @UseGuards(JwtAuthGuard)
  async createFavoriteFolder(
    @Body() createFavoriteFolderDto: CreateFavoriteFolderDto,
    @User() user: any,
  ): Promise<CreateFavoriteFolderResponseDto> {
    return await this.favoriteFolderService.createFavoriteFolder(
      createFavoriteFolderDto.name,
      user.id,
    );
  }

  @Delete(':favorite_id')
  @ApiOperation({ summary: '관심종목 폴더 삭제' })
  @ApiDeleteFavoriteFolderResponse()
  @ApiCommonErrorResponsesWithNotFound()
  @UseGuards(JwtAuthGuard)
  async deleteFavoriteFolder(
    @Param() deleteFavoriteFolderParamDto: DeleteFavoriteFolderParamDto,
    @User() user: any,
  ): Promise<DeleteFavoriteFolderResponseDto> {
    return await this.favoriteFolderService.deleteFavoriteFolder(
      deleteFavoriteFolderParamDto.favorite_id,
      user.id,
    );
  }

  @Put()
  @ApiOperation({ summary: '관심종목 폴더 수정' })
  @ApiUpdateFavoriteFolderResponse()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async updateFavoriteFolder(
    @Body() updateFavoriteFolderBodyDto: UpdateFavoriteFolderBodyDto,
    @User() user: any,
  ): Promise<UpdateFavoriteFolderResponseDto> {
    return await this.favoriteFolderService.updateFavoriteFolder(
      updateFavoriteFolderBodyDto.favorites,
      user.id,
    );
  }
}
