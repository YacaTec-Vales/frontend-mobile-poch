/**
 * DTOs del módulo Auth.
 *
 * @see auth.md del backend
 */

/** Body de POST /auth/login */
export interface LoginDto {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

/** Tokens devueltos en login y refresh */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/** Usuario autenticado devuelto en login y /auth/me */
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  branchId: string;
}

/** Respuesta completa de data en POST /auth/login */
export interface LoginResponse extends TokenResponse {
  user: AuthUser;
}

/** Body de POST /auth/refresh */
export interface RefreshDto {
  refreshToken: string;
}

/** Body de POST /auth/change-password */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
