import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import type { User } from '@vanx/database';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthEntity } from './entity/auth.entity';
import { VerificationCodesService } from './verification-codes.service';
import { MailService } from 'src/mail/mail.service';
import { prismaModulePromise } from '@vanx/database';

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
    private readonly verificationCodesService: VerificationCodesService,
    private readonly mailService: MailService,
  ) {}

  private verificationCodeTypePromise = prismaModulePromise.then(
    (module) => module.VerificationCodeType,
  );

  private async getVerificationCodeType() {
    return this.verificationCodeTypePromise;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    return user;
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
    await this.sendVerificationCode(user);
    return user;
  }

  async verifyEmail(email: string, code: string) {
    const VerificationCodeType = await this.getVerificationCodeType();
    await this.verificationCodesService.verifyCode({
      email,
      code,
      type: VerificationCodeType.SIGNUP,
    });

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.emailVerifiedAt) {
      const updated = await this.usersService.markEmailVerified(user.id);
      return this.buildAuthResponse(updated);
    }

    return this.buildAuthResponse(user);
  }

  async login(user: User) {
    return this.buildAuthResponse(user);
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return;
    }
    const VerificationCodeType = await this.getVerificationCodeType();

    const { code } = await this.verificationCodesService.createCode({
      email: user.email,
      userId: user.id,
      type: VerificationCodeType.PASSWORD_RESET,
    });

    await this.mailService.queuePasswordResetEmail({
      email: user.email,
      name: user.name,
      code,
    });
  }

  async confirmPasswordReset(email: string, code: string, password: string) {
    const VerificationCodeType = await this.getVerificationCodeType();
    await this.verificationCodesService.verifyCode({
      email,
      code,
      type: VerificationCodeType.PASSWORD_RESET,
    });

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.updatePassword(user.id, password);

    if (!user.emailVerifiedAt) {
      await this.usersService.markEmailVerified(user.id);
    }

    await this.removeRefreshToken(user.id);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hashed);
    return true;
  }

  async removeRefreshToken(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async logoutWithRefreshToken(refreshToken?: string) {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      const userId = payload.sub ?? payload.id;
      const isValid = await this.validateRefreshToken(userId, refreshToken);
      if (!isValid) {
        return;
      }
      await this.removeRefreshToken(userId);
    } catch {
      // Ignore invalid/expired tokens; logout is best-effort.
    }
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

  private async sendVerificationCode(user: User) {
    const VerificationCodeType = await this.getVerificationCodeType();
    const { code } = await this.verificationCodesService.createCode({
      email: user.email,
      userId: user.id,
      type: VerificationCodeType.SIGNUP,
    });

    await this.mailService.queueVerificationEmail({
      email: user.email,
      name: user.name,
      code,
    });
  }

  private getJwtExpiration(
    key: string,
    fallback: JwtSignOptions['expiresIn'],
  ): JwtSignOptions['expiresIn'] {
    return this.configService.get<JwtSignOptions['expiresIn']>(key) ?? fallback;
  }
}
