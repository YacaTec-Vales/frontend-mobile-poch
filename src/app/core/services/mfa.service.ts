import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiSuccessResponse } from '../types/api-response.types';
import type { MfaSetupResponse } from '../types/auth.types';

@Injectable({ providedIn: 'root' })
export class MfaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/mfa`;

  /**
   * Genera un secret TOTP y backup codes.
   * POST /api/v1/mfa/setup
   */
  setupMfa(): Observable<ApiSuccessResponse<MfaSetupResponse>> {
    const headers = { 'x-client-app': 'Tecu', 'X-Origin': 'vpn' };
    return this.http.post<ApiSuccessResponse<MfaSetupResponse>>(
      `${this.baseUrl}/setup`,
      {},
      { headers }
    );
  }

  /**
   * Confirma la configuracion de MFA.
   * POST /api/v1/mfa/verify-setup
   */
  verifySetup(code: string): Observable<ApiSuccessResponse<void>> {
    const headers = { 'x-client-app': 'Tecu', 'X-Origin': 'vpn' };
    return this.http.post<ApiSuccessResponse<void>>(
      `${this.baseUrl}/verify-setup`,
      { code },
      { headers }
    );
  }
}
