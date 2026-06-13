import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { GoogleAuthGuard } from './guards/google-oauth.guard';
import { FacebookAuthGuard } from './guards/facebook-oauth.guard';
import { GithubAuthGuard } from './guards/github-oauth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ sensitive: { limit: 5, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: { _id: { toString(): string } }) {
    return this.authService.logout(user._id.toString());
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiBearerAuth()
  @Throttle({ sensitive: { limit: 5, ttl: 60000 } })
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh token' })
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: { user: { _id: string; refreshToken: string } },
  ) {
    const userId = req.user._id;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Public()
  @Throttle({ sensitive: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Throttle({ sensitive: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @SkipThrottle({ default: true, sensitive: true, exports: true })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: Record<string, unknown>) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('mfa/setup')
  @ApiOperation({ summary: 'Initiate MFA setup' })
  @HttpCode(HttpStatus.OK)
  async mfaSetup(@CurrentUser() user: any) {
    return this.authService.generateMfaSecret(user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('mfa/enable')
  @ApiOperation({ summary: 'Verify and enable MFA' })
  @HttpCode(HttpStatus.OK)
  async mfaEnable(@CurrentUser() user: any, @Body('code') code: string) {
    return this.authService.verifyAndEnableMfa(user._id.toString(), code);
  }

  @Public()
  @Throttle({ sensitive: { limit: 5, ttl: 60000 } })
  @Post('mfa/verify')
  @ApiOperation({ summary: 'Verify MFA code to complete login' })
  @HttpCode(HttpStatus.OK)
  async mfaVerify(
    @Body('mfaToken') mfaToken: string,
    @Body('code') code: string,
  ) {
    return this.authService.verifyMfaLogin(mfaToken, code);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('mfa/disable')
  @ApiOperation({ summary: 'Disable MFA' })
  @HttpCode(HttpStatus.OK)
  async mfaDisable(@CurrentUser() user: any) {
    return this.authService.disableMfa(user._id.toString());
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Login via Google OAuth' })
  async googleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    try {
      const tokens = await this.authService.validateOAuthUser(req.user);
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'https://psei.school.com:5173';
      return res.redirect(
        `${frontendUrl}/oauth-callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
      );
    } catch (error: any) {
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'https://psei.school.com:5173';
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`,
      );
    }
  }

  @Public()
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Login via Facebook OAuth' })
  async facebookAuth() {}

  @Public()
  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  async facebookAuthRedirect(@Req() req: any, @Res() res: any) {
    try {
      const tokens = await this.authService.validateOAuthUser(req.user);
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'https://psei.school.com:5173';
      return res.redirect(
        `${frontendUrl}/oauth-callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
      );
    } catch (error: any) {
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'https://psei.school.com:5173';
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`,
      );
    }
  }

  @Public()
  @Get('github')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'Login via GitHub OAuth' })
  async githubAuth() {}

  @Public()
  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubAuthRedirect(@Req() req: any, @Res() res: any) {
    try {
      const tokens = await this.authService.validateOAuthUser(req.user);
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'https://psei.school.com:5173';
      return res.redirect(
        `${frontendUrl}/oauth-callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
      );
    } catch (error: any) {
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'https://psei.school.com:5173';
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`,
      );
    }
  }
}
