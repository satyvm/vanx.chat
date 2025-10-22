import { Body, Controller, Post,  Request, Response, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { User } from '@prisma/client';
import { UserService } from 'src/users/user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Response() res) {
    const tokens = await this.authService.generateTokens(req.user);
    console.log(tokens);
    const result = await this.authService.updateRefreshToken(req.user.id, tokens.refreshToken)

    if(!result){
       return res.status(401).send('ACCESS_DENIED');
    }

    this.setCookies(res,tokens);
    delete req.user.password;

    return res.status(200).send(true);
  }

  @Post('sign-up')
  async userSignUp(@Body() body : User){
    const user = await this.authService.userSignUp(body);

  }

  @Post('logout')
  async logout(
    @Request() req , @Response() res
  ){
    console.log(req)
    await this.authService.removeRefreshToken(req.user.id);

    res.clearCookie('ACCESS_TOKEN' ,{path : '/'});
    res.clearCookie('REFRESH_TOKEN',{path : '/'});

    return res.status(200).send('')
  }

  private setCookies(@Response() res , tokens: any){
    const options= {
      httpOnly : true,
      secure : false
    }

    res.cookie('ACCESS_TOKEN' , tokens.accessToken,options);
    res.cookie('REFRESH_TOKEN' , tokens.refreshToken,options);
  }
}
