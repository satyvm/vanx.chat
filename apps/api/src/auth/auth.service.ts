import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/user.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

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
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService // ✅
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
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
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'), // ✅ fixed typo
    });

    return new Tokens(accessToken, refreshToken);
  }

  async userSignUp(data: User) {
    const user = await this.userService.create(data);
    return this.generateTokens(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(userId, hashed);
    return true;
  }

  async removeRefreshToken(userId: string) {
    await this.userService.updateRefreshToken(userId, null);
  }

  async validateRefreshToken(userId: string, token: string) {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) return false;

    return await bcrypt.compare(token, user.refreshToken);
  }
}
