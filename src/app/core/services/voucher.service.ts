import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiSuccessResponse } from '../types/api-response.types';
import type { CreateVoucherDto, VoucherResponse } from '../types/voucher.types';

@Injectable({ providedIn: 'root' })
export class VoucherService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/vouchers`;

  create(dto: CreateVoucherDto): Observable<ApiSuccessResponse<VoucherResponse>> {
    return this.http.post<ApiSuccessResponse<VoucherResponse>>(this.baseUrl, dto);
  }
}
