import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult extends AuthTokens {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<LoginResult> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
      role: registerDto.role || UserRole.Student,
      isActive: true,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id as string,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResult> {
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id as string,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.update(userId, { refreshTokenHash: '' });
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<AuthTokens> {
    const user = await this.usersService.findByIdWithRefreshToken(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async me(user: AuthenticatedUser): Promise<LoginResult['user']> {
    const activeUser = await this.usersService.findActiveById(user.sub);

    if (!activeUser) {
      throw new UnauthorizedException('User is not authorized');
    }

    return {
      id: activeUser.id as string,
      name: activeUser.name,
      email: activeUser.email,
      role: activeUser.role,
    };
  }

  private async generateTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
    const jwtPayload: AuthenticatedUser = {
      sub: userId,
      email: email,
      role: role as UserRole,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, { refreshTokenHash: hash });
  }
}
