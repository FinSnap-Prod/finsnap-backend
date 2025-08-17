import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user/user.entity';
import { UserRepository } from './user.repository';
import { AuthRepository } from '../auth/auth.repository';
import { Auth } from 'src/database/entities/auth/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Auth])],
  controllers: [UserController],
  providers: [UserService, UserRepository, AuthRepository],
  exports: [UserService],
})
export class UserModule {}
