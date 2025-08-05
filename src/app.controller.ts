import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HealthResponseDto } from './common/swagger/dto/health-response.dto';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: '헬스 체크',
    description: '서버 상태를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '서버 정상 동작',
    type: HealthResponseDto,
  })
  getHello(): HealthResponseDto {
    return {
      success: true,
      message: '서버가 정상 동작 중입니다.',
      data: this.appService.getHello(),
    };
  }
}
