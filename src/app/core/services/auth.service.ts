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
   * Cambia la contraseña del usuario.
   * POST /api/v1/auth/change-password
   */
  changePassword(
    dto: ChangePasswordDto,
    partialToken?: string
  ): Observable<ApiSuccessResponse<void>> {
    let headers: any = { 'x-client-app': 'Poch' };
    if (partialToken) {
      headers['Authorization'] = `Bearer ${partialToken}`;
    }
    
    return this.http.post<ApiSuccessResponse<void>>(
      `${this.baseUrl}/change-password`,
      dto,
      { headers }
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

  /**
   * Verifica el código MFA para completar el login.
   * POST /api/v1/auth/mfa-verify
   */
  verifyMfa(code: string, partialToken: string): Observable<ApiSuccessResponse<LoginResponse>> {
    const headers = {
      'Authorization': `Bearer ${partialToken}`,
      'x-client-app': 'Poch'
    };
    return this.http.post<ApiSuccessResponse<LoginResponse>>(
      `${this.baseUrl}/mfa-verify`,
      { code },
      { headers }
    );
  }

  /**
   * Genera la URL del QR para configurar el MFA por primera vez.
   * POST /api/v1/mfa/setup
   */
  setupMfa(partialToken: string): Observable<ApiSuccessResponse<{ qrCodeUrl: string }>> {
    const headers = {
      'Authorization': `Bearer ${partialToken}`,
      'x-client-app': 'Poch'
    };
    // Note: Assuming MFA routes are under /mfa or /auth/mfa depending on the backend.
    // The markdown says /api/v1/mfa/setup, so baseUrl is not used here if it's /api/v1/auth.
    const url = `${environment.apiUrl}/mfa/setup`;
    return this.http.post<ApiSuccessResponse<{ qrCodeUrl: string }>>(
      url,
      {},
      { headers }
    );
  }

  /**
   * Verifica el código MFA tras escanear el QR en la configuración.
   * POST /api/v1/mfa/verify-setup
   */
  verifySetupMfa(code: string, partialToken: string): Observable<ApiSuccessResponse<LoginResponse>> {
    const headers = {
      'Authorization': `Bearer ${partialToken}`,
      'x-client-app': 'Poch'
    };
    const url = `${environment.apiUrl}/mfa/verify-setup`;
    return this.http.post<ApiSuccessResponse<LoginResponse>>(
      url,
      { code },
      { headers }
    );
  }

}