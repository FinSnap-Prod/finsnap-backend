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
import { PortfolioService } from './portfolio.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiCommonErrorResponses,
  ApiCommonErrorResponsesWithNotFound,
  ApiPortfolioParam,
  ApiGetAllPortfolioResponse,
  ApiCreatePortfolio,
  ApiDeletePortfolioResponse,
  ApiUpdatePortfolio,
  ApiGetPortfolioSummaryResponse,
} from 'src/common/swagger';

import {
  CreatePortfolioRequestDto,
  CreatePortfolioResponseDto,
  DeletePortfolioParamDto,
  DeletePortfolioResponseDto,
  GetAllPortfolioResponseDto,
  GetPortfolioSummaryParamDto,
  GetPortfolioSummaryResponseDto,
  UpdatePortfolioRequestDto,
  UpdatePortfolioResponseDto,
} from '../dto';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { User } from 'src/modules/auth/decorators/user.decorator';

@ApiTags('portfolios')
@ApiBearerAuth()
@Controller('portfolios')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: '포트폴리오 조회' })
  @ApiGetAllPortfolioResponse()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async getAllPortfolio(
    @User() user: any,
  ): Promise<GetAllPortfolioResponseDto> {
    return await this.portfolioService.getAllPortfolio(user.id);
  }

  @Post()
  @ApiOperation({ summary: '포트폴리오 생성' })
  @ApiCreatePortfolio()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async createPortfolio(
    @Body() createPortfolioRequestDto: CreatePortfolioRequestDto,
    @User() user: any,
  ): Promise<CreatePortfolioResponseDto> {
    return await this.portfolioService.createPortfolio(
      user.id,
      createPortfolioRequestDto.name,
    );
  }

  @Delete(':portfolio_id')
  @ApiOperation({ summary: '포트폴리오 삭제' })
  @ApiPortfolioParam()
  @ApiDeletePortfolioResponse()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async deletePortfolio(
    @Param() deletePortfolioParamDto: DeletePortfolioParamDto,
    @User() user: any,
  ): Promise<DeletePortfolioResponseDto> {
    return await this.portfolioService.deletePortfolio(
      Number(deletePortfolioParamDto.portfolio_id),
      user.id,
    );
  }

  @Put()
  @ApiOperation({ summary: '포트폴리오 수정' })
  @ApiPortfolioParam()
  @ApiUpdatePortfolio()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async updatePortfolio(
    @Body() updatePortfolioRequestDto: UpdatePortfolioRequestDto,
    @User() user: any,
  ): Promise<UpdatePortfolioResponseDto> {
    return await this.portfolioService.updatePortfolio(
      updatePortfolioRequestDto.portfolios,
      user.id,
    );
  }

  @Get(':portfolio_id')
  @ApiOperation({ summary: '포트폴리오 요약정보 조회' })
  @ApiPortfolioParam()
  @ApiGetPortfolioSummaryResponse()
  @ApiCommonErrorResponsesWithNotFound()
  @UseGuards(JwtAuthGuard)
  async getPortfolioSummary(
    @Param() getPortfolioSummaryParamDto: GetPortfolioSummaryParamDto,
    @User() user: any,
  ): Promise<GetPortfolioSummaryResponseDto> {
    return await this.portfolioService.getPortfolioSummary(
      Number(getPortfolioSummaryParamDto.portfolio_id),
      user.id,
    );
  }
}
