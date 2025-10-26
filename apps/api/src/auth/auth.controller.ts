import {
  Body,
  Controller,
  Post,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto } from './dto/login.dto'; // TODO: Add validation dto
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import type { User } from '@prisma/client';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  async login(@Request() req, @Response() res) {
    const tokens = await this.authService.generateTokens(req.user);
    const result = await this.authService.updateRefreshToken(
      req.user.id,
      tokens.refreshToken,
    );

    if (!result) {
      return res.status(401).send('ACCESS_DENIED');
    }

    this.setCookies(res, tokens);
    delete req.user.password;

    return res.status(200).json({ success: true });
  }

  @Post('sign-up')
  @ApiOkResponse({ type: AuthEntity })
  async userSignUp(@Body() body: CreateUserDto) {
    const user = await this.authService.userSignUp(body);
  }

  @Post('logout')
  @ApiOkResponse({ type: AuthEntity })
  async logout(@Request() req, @Response() res) {
    await this.authService.removeRefreshToken(req.user.id);

    res.clearCookie('ACCESS_TOKEN', { path: '/' });
    res.clearCookie('REFRESH_TOKEN', { path: '/' });

    return res.status(200).json({ success: true });
  }

  private setCookies(@Response() res, tokens: any) {
    const options = {
      httpOnly: true,
      secure: false,
    };

    res.cookie('ACCESS_TOKEN', tokens.accessToken, options);
    res.cookie('REFRESH_TOKEN', tokens.refreshToken, options);
  }
}
