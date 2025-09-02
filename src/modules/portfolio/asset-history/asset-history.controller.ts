import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AssetHistoryService } from './asset-history.service';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiCategoryParams,
  ApiCommonErrorResponses,
  ApiCreateAssetHistory,
} from 'src/common/swagger';
import {
  CreateAssetHistoryParamDto,
  CreateAssetHistoryRequestDto,
  CreateAssetHistoryResponseDto,
  GetAssetHistoryParamDto,
  GetAssetHistoryQueryDto,
  GetAssetHistoryResponseDto,
} from '../dto';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { User } from 'src/modules/auth/decorators/user.decorator';

@Controller('portfolios')
export class AssetHistoryController {
  constructor(private readonly assetHistoryService: AssetHistoryService) {}

  @Get(':portfolio_id/categories/:category_id/assets/:asset_id/histories')
  @ApiOperation({ summary: '자산 거래내역 조회' })
  @ApiCategoryParams()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async getAssetHistories(
    @Param() getAssetHistoryParamDto: GetAssetHistoryParamDto,
    @Query() getAssetHistoryQueryDto: GetAssetHistoryQueryDto,
    @User() user: any,
  ): Promise<GetAssetHistoryResponseDto> {
    return await this.assetHistoryService.getAssetHistories(
      Number(getAssetHistoryParamDto.portfolio_id),
      Number(getAssetHistoryParamDto.category_id),
      Number(getAssetHistoryParamDto.asset_id),
      user.id,
      getAssetHistoryQueryDto,
    );
  }

  @Post(':portfolio_id/categories/:category_id/assets/:asset_id/histories')
  @ApiOperation({ summary: '자산 추가 및 거래내역 추가' })
  @ApiCategoryParams()
  @ApiCreateAssetHistory()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async createAssetHistory(
    @Param() createAssetHistoryParamDto: CreateAssetHistoryParamDto,
    @Body() createAssetHistoryRequestDto: CreateAssetHistoryRequestDto,
    @User() user: any,
  ): Promise<CreateAssetHistoryResponseDto> {
    return await this.assetHistoryService.createAssetHistory(
      Number(createAssetHistoryParamDto.portfolio_id),
      Number(createAssetHistoryParamDto.category_id),
      Number(createAssetHistoryParamDto.asset_id),
      createAssetHistoryRequestDto,
      user.id,
    );
  }
}
