import {
  Body,
  Controller,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';

class SignupPendingResponse {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  email: string;

  @ApiProperty()
  message: string;
}

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  async login(
    @Body() _body: LoginDto,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = await this.authService.login(req.user);
    this.setCookies(res, payload);
    return payload;
  }

  @Public()
  @Post('sign-up')
  @ApiOkResponse({ type: SignupPendingResponse })
  async userSignUp(@Body() body: CreateUserDto) {
    const user = await this.authService.userSignUp(body);
    return {
      success: true,
      email: user.email,
      message: 'Verification code sent to your email',
    };
  }

  @Public()
  @Post('email/verify')
  @ApiOkResponse({ type: AuthEntity })
  async verifyEmail(
    @Body() body: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = await this.authService.verifyEmail(body.email, body.code);
    this.setCookies(res, payload);
    return payload;
  }

  @Public()
  @Post('logout')
  @ApiOkResponse({
    schema: {
      example: { success: true },
    },
  })
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logoutWithRefreshToken(req.cookies?.REFRESH_TOKEN);

    const options = this.getCookieOptions();
    res.clearCookie('ACCESS_TOKEN', options);
    res.clearCookie('REFRESH_TOKEN', options);

    return { success: true };
  }

  @Public()
  @Post('refresh')
  @ApiOkResponse({ type: AuthEntity })
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    const payload = await this.authService.refresh(req.cookies?.REFRESH_TOKEN);
    this.setCookies(res, payload);
    return payload;
  }

  @Public()
  @Post('password/reset/request')
  @ApiOkResponse({
    schema: {
      example: { success: true },
    },
  })
  async requestPasswordReset(@Body() body: RequestPasswordResetDto) {
    await this.authService.requestPasswordReset(body.email);
    return { success: true };
  }

  @Public()
  @Post('password/reset/confirm')
  @ApiOkResponse({
    schema: {
      example: { success: true },
    },
  })
  async confirmPasswordReset(@Body() body: ConfirmPasswordResetDto) {
    await this.authService.confirmPasswordReset(
      body.email,
      body.code,
      body.password,
    );
    return { success: true };
  }

  private getCookieOptions(): CookieOptions {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
    const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
    if (cookieDomain) {
      cookieOptions.domain = cookieDomain;
    }
    return cookieOptions;
  }

  private setCookies(res: Response, tokens: AuthEntity) {
    const options = this.getCookieOptions();

    res.cookie('ACCESS_TOKEN', tokens.accessToken, {
      ...options,
      maxAge: this.parseExpiryToMs(
        this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
      ),
    });
    res.cookie('REFRESH_TOKEN', tokens.refreshToken, {
      ...options,
      maxAge: this.parseExpiryToMs(
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      ),
    });
  }

  private parseExpiryToMs(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match || !match[1] || !match[2]) {
      return 1000 * 60 * 15;
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 1000 * 60 * 15;
    }
  }
}
