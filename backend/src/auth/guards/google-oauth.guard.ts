import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super({
      accessType: 'offline',
      prompt: 'consent',
    });
  }

  getAuthenticateOptions(context: any) {
    const request = context.switchToHttp().getRequest();
    const role = request.query.role || 'STUDENT';
    return {
      state: JSON.stringify({ role }),
    };
  }
}
