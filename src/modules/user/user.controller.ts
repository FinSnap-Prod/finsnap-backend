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
  @UseGuards(JwtAuthGuard)
  async getUser(@User() user: any): Promise<GetUserResponseDto> {
    return await this.userService.getUser(user.id);
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
