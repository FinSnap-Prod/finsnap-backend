import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiCommonErrorResponses,
  ApiDeleteUserResponse,
  ApiGetUserResponse,
  ApiUpdateNicknameResponse,
} from 'src/common/swagger';
import {
  DeleteUserRequestDto,
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

  @Delete('me')
  @ApiOperation({ summary: '사용자 탈퇴' })
  @ApiDeleteUserResponse()
  @ApiCommonErrorResponses()
  @UseGuards(JwtAuthGuard)
  async deleteUser(
    @User() user: any,
    @Body() deleteUserRequestDto: DeleteUserRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<DeleteUserResponseDto> {
    const { delete_reason } = deleteUserRequestDto;

    const result = await this.userService.deleteUser(user.id, delete_reason);

    // 탈퇴 성공 시 refresh_token 쿠키 삭제
    if (result.success && result.data.status === 'deactivated') {
      res.clearCookie('refresh_token', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });
    }

    return result;
  }
}
