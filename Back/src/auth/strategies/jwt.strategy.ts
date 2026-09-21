import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

const cookieExtractor = (request: { cookies?: Record<string, string> }) => request?.cookies?.andarna_session ?? null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({ jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]), ignoreExpiration: false, secretOrKey: config.getOrThrow<string>('JWT_SECRET') });
  }
  validate(payload: { sub: string; email: string }) { return { id: payload.sub, email: payload.email }; }
}
