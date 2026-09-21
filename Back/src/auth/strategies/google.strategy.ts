import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { GoogleProfile } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    // Valores de reserva mantêm a API disponível para autenticação local quando
    // as credenciais Google ainda não foram cadastradas no ambiente.
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || 'google-not-configured',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || 'google-not-configured',
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }
  validate(_accessToken: string, _refreshToken: string, profile: Profile): GoogleProfile {
    const email = profile.emails?.[0]?.value;
    if (!email) throw new Error('O Google não retornou um e-mail para esta conta.');
    return { googleId: profile.id, email, name: profile.displayName, avatarUrl: profile.photos?.[0]?.value };
  }
}
