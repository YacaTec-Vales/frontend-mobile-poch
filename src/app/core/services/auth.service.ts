import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiSuccessResponse } from '../types/api-response.types';
import type {
  AuthUser,
  ChangePasswordDto,
  LoginDto,
  LoginResponse,
  TokenResponse,
} from '../types/auth.types';
import { TokenStorageService } from './token-storage.service';

/**
 * Punto de entrada único para operaciones de autenticación.
 * Los componentes llaman a este servicio; nunca usan HttpClient directamente.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  /**
   * Inicia sesión contra el backend.
   * POST /api/v1/auth/login
   */
  login(dto: LoginDto): Observable<ApiSuccessResponse<LoginResponse>> {
    return this.http.post<ApiSuccessResponse<LoginResponse>>(
      `${this.baseUrl}/login`,
      dto,
    );
  }

  /**
   * Renueva los tokens usando el refresh token almacenado.
   * POST /api/v1/auth/refresh
   */
  refresh(): Observable<ApiSuccessResponse<TokenResponse>> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    return this.http.post<ApiSuccessResponse<TokenResponse>>(
      `${this.baseUrl}/refresh`,
      { refreshToken },
    );
  }

  /**
   * Cierra sesión en el servidor e invalida el refresh token.
   * POST /api/v1/auth/logout
   * El refresh token es opcional según el backend.
   */
  logout(): Observable<ApiSuccessResponse<void>> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    const body = refreshToken ? { refreshToken } : {};

    return this.http
      .post<ApiSuccessResponse<void>>(`${this.baseUrl}/logout`, body)
      .pipe(tap(() => this.clearSession()));
  }

  /**
   * Obtiene los datos del usuario autenticado actual.
   * GET /api/v1/auth/me
   */
  getMe(): Observable<ApiSuccessResponse<AuthUser>> {
    return this.http.get<ApiSuccessResponse<AuthUser>>(
      `${this.baseUrl}/me`,
    );
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   * POST /api/v1/auth/change-password
   */
  changePassword(
    dto: ChangePasswordDto,
  ): Observable<ApiSuccessResponse<void>> {
    return this.http.post<ApiSuccessResponse<void>>(
      `${this.baseUrl}/change-password`,
      dto,
    );
  }

  /** Guarda tokens y usuario en storage después de login exitoso. */
  saveSession(data: LoginResponse): void {
    this.tokenStorage.saveSession(data);
  }

  /** Limpia toda la sesión local. */
  clearSession(): void {
    this.tokenStorage.clearSession();
  }

  /** Devuelve el access token actual o null. */
  getToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  /** Verifica si hay una sesión activa (tiene token). */
  isAuthenticated(): boolean {
    return this.tokenStorage.hasToken();
  }
}
