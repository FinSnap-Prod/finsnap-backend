import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
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

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Patch('nickname')
  @ApiOperation({ summary: '사용자 닉네임 수정' })
  @ApiUpdateNicknameResponse()
  @ApiCommonErrorResponses()
  async updateNickname(
    @Body() updateNicknameRequestDto: UpdateNicknameRequestDto,
  ): Promise<UpdateNicknameResponseDto> {
    const mockData: UpdateNicknameResponseDto = {
      success: true,
      message: 'Nickname updated successfully.',
      data: {
        nickname: updateNicknameRequestDto.nickname,
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
