import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    super({
      clientID:
        configService.get<string>('FACEBOOK_CLIENT_ID') ||
        'facebook-client-id-placeholder',
      clientSecret:
        configService.get<string>('FACEBOOK_CLIENT_SECRET') ||
        'facebook-client-secret-placeholder',
      callbackURL:
        configService.get<string>('FACEBOOK_CALLBACK_URL') ||
        'https://api.psei.school.com:3000/auth/facebook/callback',
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      return done(
        new BadRequestException(
          'Email address is required from Facebook profile',
        ),
        false,
      );
    }

    const user = {
      provider: 'facebook',
      providerId: id,
      email: email.toLowerCase(),
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
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
