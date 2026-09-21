import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user.entity';

export type GoogleProfile = { googleId: string; email: string; name?: string; avatarUrl?: string };

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>, private readonly jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    if (await this.users.existsBy({ email })) throw new ConflictException('Este e-mail já está cadastrado.');
    const user = await this.users.save(this.users.create({ email, name: dto.name?.trim() || null, passwordHash: await bcrypt.hash(dto.password, 12) }));
    return this.issueSession(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.createQueryBuilder('user').addSelect('user.passwordHash').where('user.email = :email', { email: dto.email.toLowerCase().trim() }).getOne();
    if (!user?.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('E-mail ou senha inválidos.');
    return this.issueSession(user);
  }

  async loginWithGoogle(profile: GoogleProfile) {
    const email = profile.email.toLowerCase().trim();
    let user = await this.users.findOne({ where: [{ googleId: profile.googleId }, { email }] });
    if (!user) user = this.users.create({ email, googleId: profile.googleId, name: profile.name ?? null, avatarUrl: profile.avatarUrl ?? null });
    else { user.googleId ??= profile.googleId; user.name ??= profile.name ?? null; user.avatarUrl ??= profile.avatarUrl ?? null; }
    user = await this.users.save(user);
    return this.issueSession(user);
  }

  async findPublicUser(id: string) { const user = await this.users.findOneByOrFail({ id }); return this.publicUser(user); }
  private issueSession(user: User) { return { accessToken: this.jwt.sign({ sub: user.id, email: user.email }), user: this.publicUser(user) }; }
  private publicUser(user: User) { return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, createdAt: user.createdAt }; }
}
