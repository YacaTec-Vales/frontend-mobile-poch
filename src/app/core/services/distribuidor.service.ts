import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiSuccessResponse } from '../types/api-response.types';
import type { DistribuidorStatus, CreateCreditRaiseDto, CreditRaiseRequest, PaginatedDistribuidores } from '../types/distribuidor.types';

@Injectable({ providedIn: 'root' })
export class DistribuidorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/distribuidores`;

  getDistribuidores(params?: { page?: number; limit?: number; status?: string }): Observable<ApiSuccessResponse<PaginatedDistribuidores>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    if (params?.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<ApiSuccessResponse<PaginatedDistribuidores>>(this.baseUrl, { params: httpParams });
  }

  getMyStatus(): Observable<ApiSuccessResponse<DistribuidorStatus>> {
    return this.http.get<ApiSuccessResponse<DistribuidorStatus>>(`${this.baseUrl}/me`);
  }

  requestCreditRaise(id: string, dto: CreateCreditRaiseDto): Observable<ApiSuccessResponse<CreditRaiseRequest>> {
    return this.http.post<ApiSuccessResponse<CreditRaiseRequest>>(`${this.baseUrl}/${id}/credit-raise-requests`, dto);
  }
}
