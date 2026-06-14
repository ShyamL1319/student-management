import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Security: Enforce expiration checks
      secretOrKey: configService.get<string>('JWT_SECRET') || 'supersecret',
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Invalid token claims');
    }
    // Return claims directly, saving an expensive user DB lookup on every call
    return {
      _id: payload.sub,
      email: payload.email,
      role: payload.role,
      schoolId: payload.schoolId,
    };
  }
}
