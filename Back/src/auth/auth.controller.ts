import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService, GoogleProfile } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

type AuthenticatedRequest = Request & { user: { id: string; email: string } | GoogleProfile };

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly config: ConfigService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const session = await this.auth.register(dto);
    this.setSessionCookie(response, session.accessToken);
    return { user: session.user };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const session = await this.auth.login(dto);
    this.setSessionCookie(response, session.accessToken);
    return { user: session.user };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() { /* Passport redireciona para o Google. */ }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() request: AuthenticatedRequest, @Res() response: Response) {
    const session = await this.auth.loginWithGoogle(request.user as GoogleProfile);
    this.setSessionCookie(response, session.accessToken);
    return response.redirect(`${this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173'}/auth/callback`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: AuthenticatedRequest) { return { user: await this.auth.findPublicUser((request.user as { id: string }).id) }; }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('andarna_session', { httpOnly: true, sameSite: 'lax', secure: this.isProduction() });
    return { message: 'Sessão encerrada.' };
  }

  private setSessionCookie(response: Response, token: string) { response.cookie('andarna_session', token, { httpOnly: true, sameSite: 'lax', secure: this.isProduction(), maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' }); }
  private isProduction() { return this.config.get<string>('NODE_ENV') === 'production'; }
}
