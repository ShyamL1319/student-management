import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID:
        configService.get<string>('GITHUB_CLIENT_ID') ||
        'github-client-id-placeholder',
      clientSecret:
        configService.get<string>('GITHUB_CLIENT_SECRET') ||
        'github-client-secret-placeholder',
      callbackURL:
        configService.get<string>('GITHUB_CALLBACK_URL') ||
        'https://api.psei.school.com:3000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { displayName, username, emails, photos, id } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      return done(
        new BadRequestException(
          'Email address is required from GitHub profile',
        ),
        false,
      );
    }

    const fullName = displayName || username || '';
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    const user = {
      provider: 'github',
      providerId: id,
      email: email.toLowerCase(),
      firstName,
      lastName,
      avatar: photos?.[0]?.value || '',
      metadata: {
        accessToken,
        refreshToken,
        ...profile._json,
      },
    };
    done(undefined, user);
  }
}
