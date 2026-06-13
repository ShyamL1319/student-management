import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID:
        configService.get<string>('GOOGLE_CLIENT_ID') ||
        'google-client-id-placeholder',
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') ||
        'google-client-secret-placeholder',
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'https://api.psei.school.com:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;

    // Validate email verification if info is present
    const isEmailVerified =
      profile.emails?.[0]?.verified || profile._json?.email_verified;
    if (
      isEmailVerified === false ||
      profile._json?.email_verified === 'false'
    ) {
      return done(
        new UnauthorizedException('Email address is not verified by Google'),
        false,
      );
    }

    const email = emails?.[0]?.value;
    if (!email) {
      return done(
        new UnauthorizedException(
          'No email address provided in Google profile',
        ),
        false,
      );
    }

    const user = {
      provider: 'google',
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
