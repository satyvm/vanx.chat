import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: extractCookie,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}

function extractCookie(req: any) {
  if (req?.cookies?.ACCESS_TOKEN) {
    return req.cookies['ACCESS_TOKEN'];
  }
  return null;
}
