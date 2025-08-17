import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from '../../database/entities/user/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 유저 정보 생성
  async createUser(
    email: string,
    nickname: string,
    profile_image: string,
  ): Promise<User> {
    const user = this.userRepository.create({
      email,
      nickname,
      profile_image,
    });
    return this.userRepository.save(user);
  }

  // 유저 조회 from JWTstrategy, RefreshStrategy ...
  async findUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId, deleted: false },
    });
  }

  // 유저 닉네임 중복 검사 (자신 제외)
  async findByNicknameExcludeSelf(nickname: string, userId: string) {
    return this.userRepository.findOne({
      where: { nickname, id: Not(userId) },
    });
  }

  // 유저 닉네임 수정
  async updateUser(userId: string, nickname: string) {
    return this.userRepository.update({ id: userId }, { nickname });
  }
}
