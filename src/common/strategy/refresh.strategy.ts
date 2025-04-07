import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('RT_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: User) {
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();
    console.log('Refresh token from request:', refreshToken);

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');
    console.log('Refresh token:', refreshToken);

    return {
      ...payload,
      refreshToken,
    };
  }
}
