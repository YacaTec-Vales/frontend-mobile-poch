import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiSuccessResponse } from '../types/api-response.types';
import type { Product } from '../types/product.types';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  getProducts(params?: { variant?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Observable<ApiSuccessResponse<Product[]>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.variant) httpParams = httpParams.set('variant', params.variant);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    return this.http.get<ApiSuccessResponse<Product[]>>(this.baseUrl, { params: httpParams });
  }
}
