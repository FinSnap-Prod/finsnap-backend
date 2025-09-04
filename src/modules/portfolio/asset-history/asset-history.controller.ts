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
import { AssetHistoryService } from './asset-history.service';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiCategoryParams,
  ApiCommonErrorResponses,
  ApiCommonErrorResponsesWithNotFound,
  ApiCreateAssetHistory,
  ApiDeleteAssetHistoryResponse,
  ApiHistoryParams,
  ApiUpdateAssetHistory,
} from 'src/common/swagger';
import {
  CreateAssetHistoryParamDto,
  CreateAssetHistoryRequestDto,
  CreateAssetHistoryResponseDto,
  DeleteAssetHistoryParamDto,
  DeleteAssetHistoryResponseDto,
  GetAssetHistoryParamDto,
  GetAssetHistoryQueryDto,
  GetAssetHistoryResponseDto,
  UpdateAssetHistoryParamDto,
  UpdateAssetHistoryRequestDto,
  UpdateAssetHistoryResponseDto,
} from '../dto';
import { User } from 'src/modules/auth/decorators/user.decorator';

@Controller('portfolios')
export class AssetHistoryController {
  constructor(private readonly assetHistoryService: AssetHistoryService) {}

  @Get(':portfolio_id/categories/:category_id/assets/:asset_id/histories')
  @ApiOperation({ summary: '자산 거래내역 조회' })
  @ApiCategoryParams()
  @ApiCommonErrorResponses()
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

  @Delete(
    ':portfolio_id/categories/:category_id/assets/:asset_id/histories/:history_id',
  )
  @ApiOperation({ summary: '거래내역 삭제' })
  @ApiHistoryParams()
  @ApiDeleteAssetHistoryResponse()
  @ApiCommonErrorResponsesWithNotFound()
  async deleteAssetHistory(
    @Param() deleteAssetHistoryParamsDto: DeleteAssetHistoryParamDto,
    @User() user: any,
  ): Promise<DeleteAssetHistoryResponseDto> {
    return await this.assetHistoryService.deleteAssetHistory(
      Number(deleteAssetHistoryParamsDto.portfolio_id),
      Number(deleteAssetHistoryParamsDto.category_id),
      Number(deleteAssetHistoryParamsDto.asset_id),
      Number(deleteAssetHistoryParamsDto.history_id),
      user.id,
    );
  }

  @Put(
    ':portfolio_id/categories/:category_id/assets/:asset_id/histories/:history_id',
  )
  @ApiOperation({ summary: '거래내역 수정' })
  @ApiHistoryParams()
  @ApiUpdateAssetHistory()
  @ApiCommonErrorResponsesWithNotFound()
  async updateAssetHistory(
    @Param() updateAssetHistoryParamsDto: UpdateAssetHistoryParamDto,
    @Body() updateAssetHistoryRequestDto: UpdateAssetHistoryRequestDto,
    @User() user: any,
  ): Promise<UpdateAssetHistoryResponseDto> {
    return await this.assetHistoryService.updateAssetHistory(
      Number(updateAssetHistoryParamsDto.portfolio_id),
      Number(updateAssetHistoryParamsDto.category_id),
      Number(updateAssetHistoryParamsDto.asset_id),
      Number(updateAssetHistoryParamsDto.history_id),
      updateAssetHistoryRequestDto,
      user.id,
    );
  }
}
