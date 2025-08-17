import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../../database/entities/auth/auth.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  // 소셜 아이디로 인증 정보 조회
  async findBySocialId(socialId: string): Promise<Auth | null> {
    return this.authRepository.findOne({
      where: { social_id: socialId },
      relations: ['user'],
    });
  }

  // 인증 정보 생성
  async createAuth(
    userId: string,
    socialId: string,
    provider: string,
  ): Promise<Auth> {
    const auth = this.authRepository.create({
      user_id: userId,
      social_id: socialId,
      provider,
      access_token: '',
      refresh_token: '',
    });
    return this.authRepository.save(auth);
  }

  // 토큰 정보 업데이트
  async storeTokens(
    userId: string,
    access_token: string,
    refresh_token: string,
  ) {
    await this.authRepository.update(
      { user_id: userId },
      { access_token, refresh_token },
    );
  }

  // 새로운 AT 저장
  async storeAccessToken(userId: string, accessToken: string) {
    await this.authRepository.update(
      { user_id: userId },
      { access_token: accessToken },
    );
  }

  // 로그아웃 - 토큰 무효화
  async invalidateTokens(userId: string) {
    await this.authRepository.update(
      { user_id: userId },
      { access_token: null, refresh_token: null },
    );
  }

  // 유저 ID로 인증 정보 조회
  async findAuthByUserId(userId: string): Promise<Auth | null> {
    return this.authRepository.findOne({
      where: { user_id: userId },
    });
  }
}
