import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiCommonErrorResponses,
  ApiDeleteUserResponse,
  ApiGetUserResponse,
  ApiUpdateNicknameResponse,
} from 'src/common/swagger';
import {
  DeleteUserResponseDto,
  GetUserResponseDto,
  UpdateNicknameRequestDto,
  UpdateNicknameResponseDto,
} from './dto';
import { User } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('nickname')
  @ApiOperation({ summary: '사용자 닉네임 수정' })
  @ApiUpdateNicknameResponse()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async updateNickname(
    @User() user: any,
    @Body() updateNicknameRequestDto: UpdateNicknameRequestDto,
  ): Promise<UpdateNicknameResponseDto> {
    try {
      const { nickname } = updateNicknameRequestDto;

      return await this.userService.updateNickname(user.id, nickname);
    } catch (error) {
      throw new HttpException(
        ErrorResponseUtil.badRequest(error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('me')
  @ApiOperation({ summary: '사용자 정보 조회' })
  @ApiGetUserResponse()
  @ApiCommonErrorResponses()
  async getUser(): Promise<GetUserResponseDto> {
    const mockData: GetUserResponseDto = {
      success: true,
      message: 'User info retrieved successfully.',
      data: {
        id: '26b3e24b-9f53-412c-a6a0-80b92f1e36d8',
        provider: 'google',
        email: 'test@test.com',
        nickname: '승수',
        profile_image: 'https://cdn.../profile.png',
        created_at: '2025-07-01T10:00:00.000Z',
      },
    };

    return mockData;
  }

  @Delete()
  @ApiOperation({ summary: '사용자 탈퇴' })
  @ApiDeleteUserResponse()
  @ApiCommonErrorResponses()
  async deleteUser(): Promise<DeleteUserResponseDto> {
    const mockData: DeleteUserResponseDto = {
      success: true,
      message: 'User account deleted successfully.',
    };

    return mockData;
  }
}
