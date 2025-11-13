import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthEntity } from './entity/auth.entity';

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
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.getJwtExpiration('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.getJwtExpiration('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return new Tokens(accessToken, refreshToken);
  }

  async userSignUp(data: CreateUserDto) {
    const user = await this.usersService.create(data);
    return this.buildAuthResponse(user);
  }

  async login(user: User) {
    return this.buildAuthResponse(user);
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

  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload.sub ?? payload.id;
      const isValid = await this.validateRefreshToken(userId, refreshToken);

      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.buildAuthResponse(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async buildAuthResponse(user: User): Promise<AuthEntity> {
    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return Object.assign(new AuthEntity(), {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: new UserEntity(user),
    });
  }

  private getJwtExpiration(
    key: string,
    fallback: JwtSignOptions['expiresIn'],
  ): JwtSignOptions['expiresIn'] {
    return this.configService.get<JwtSignOptions['expiresIn']>(key) ?? fallback;
  }
}
