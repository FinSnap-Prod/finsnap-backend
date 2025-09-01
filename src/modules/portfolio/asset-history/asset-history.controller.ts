import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
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
} from '../dto';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { User } from 'src/modules/auth/decorators/user.decorator';

@Controller('portfolios')
export class AssetHistoryController {
  constructor(private readonly assetHistoryService: AssetHistoryService) {}

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
