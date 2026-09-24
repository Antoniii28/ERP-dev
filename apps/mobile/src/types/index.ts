export interface AppUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
