import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entity/auth.entity';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class Tokens {
  accessToken: string;
  refreshToken: string;
  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async generateTokens(user: User) {
    const payload = { id: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    return new Tokens(accessToken, refreshToken);
  }

  async userSignUp(data: CreateUserDto) {
    const user = await this.usersService.create(data);
    return this.generateTokens(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hashed);
    return true;
  }

  async removeRefreshToken(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async validateRefreshToken(userId: string, token: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) return false;

    return await bcrypt.compare(token, user.refreshToken);
  }
}
