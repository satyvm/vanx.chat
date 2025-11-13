import {
  Body,
  Controller,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

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
  async login(@Body() _body: LoginDto, @Request() req, @Response() res) {
    const payload = await this.authService.login(req.user);
    this.setCookies(res, payload);
    return res.status(200).json(payload);
  }

  @Public()
  @Post('sign-up')
  @ApiOkResponse({ type: AuthEntity })
  async userSignUp(@Body() body: CreateUserDto, @Response() res) {
    const payload = await this.authService.userSignUp(body);
    this.setCookies(res, payload);
    return res.status(201).json(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOkResponse({
    schema: {
      example: { success: true },
    },
  })
  async logout(@Request() req, @Response() res) {
    await this.authService.removeRefreshToken(req.user.id);

    const options = this.getCookieOptions();
    res.clearCookie('ACCESS_TOKEN', options);
    res.clearCookie('REFRESH_TOKEN', options);

    return res.status(200).json({ success: true });
  }

  @Public()
  @Post('refresh')
  @ApiOkResponse({ type: AuthEntity })
  async refresh(@Request() req, @Response() res) {
    const payload = await this.authService.refresh(req.cookies?.REFRESH_TOKEN);
    this.setCookies(res, payload);
    return res.status(200).json(payload);
  }

  private getCookieOptions() {
    return {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
  }

  private setCookies(@Response() res, tokens: AuthEntity) {
    const options = this.getCookieOptions();

    res.cookie('ACCESS_TOKEN', tokens.accessToken, options);
    res.cookie('REFRESH_TOKEN', tokens.refreshToken, {
      ...options,
      maxAge: this.getRefreshCookieMaxAge(),
    });
  }

  private getRefreshCookieMaxAge() {
    const raw = this.configService.get<string>('REFRESH_COOKIE_MAX_AGE');
    const parsed = raw ? Number(raw) : NaN;
    return Number.isNaN(parsed) ? 1000 * 60 * 60 * 24 * 7 : parsed;
  }
}
