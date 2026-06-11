import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
