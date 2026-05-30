import { UserRole } from '../../users/schemas/user.schema';

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: UserRole;
}
