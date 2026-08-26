import { Injectable } from '@angular/core';
import type { AuthUser, LoginResponse } from '../types/auth.types';

const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

/**
 * Abstracción sobre localStorage para tokens y datos de sesión.
 * Centraliza lectura/escritura para facilitar pruebas y migraciones.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {

  getAccessToken(): string | null {
    return localStorage.getItem(KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(KEYS.REFRESH_TOKEN);
  }

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  /** Guarda solo los tokens (usado por el interceptor de refresh). */
  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
  }

  /** Actualiza solo los datos del usuario (usado por el guard tras /auth/me). */
  saveUser(user: AuthUser): void {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  }

  saveSession(data: LoginResponse): void {
    localStorage.setItem(KEYS.ACCESS_TOKEN, data.accessToken);
    localStorage.setItem(KEYS.REFRESH_TOKEN, data.refreshToken);
    localStorage.setItem(KEYS.USER, JSON.stringify(data.user));
  }

  clearSession(): void {
    localStorage.removeItem(KEYS.ACCESS_TOKEN);
    localStorage.removeItem(KEYS.REFRESH_TOKEN);
    localStorage.removeItem(KEYS.USER);
  }

  hasToken(): boolean {
    return !!this.getAccessToken();
  }
}
