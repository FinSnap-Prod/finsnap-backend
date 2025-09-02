import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { AssetService } from './asset.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiAssetParams,
  ApiCommonErrorResponsesWithNotFound,
  ApiDeleteAssetResponse,
} from 'src/common/swagger';
import { DeleteAssetParamDto, DeleteAssetResponseDto } from '../dto';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { User } from 'src/modules/auth/decorators/user.decorator';

@ApiTags('portfolios')
@ApiBearerAuth()
@Controller('portfolios')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Delete(':portfolio_id/categories/:category_id/assets/:asset_id')
  @ApiOperation({ summary: '자산 삭제' })
  @ApiAssetParams()
  @ApiDeleteAssetResponse()
  @ApiCommonErrorResponsesWithNotFound()
  @UseGuards(JwtAuthGuard)
  async deleteAsset(
    @Param() deleteAssetParamDto: DeleteAssetParamDto,
    @User() user: any,
  ): Promise<DeleteAssetResponseDto> {
    return await this.assetService.deleteAsset(
      Number(deleteAssetParamDto.portfolio_id),
      Number(deleteAssetParamDto.category_id),
      Number(deleteAssetParamDto.asset_id),
      user.id,
    );
  }
}
