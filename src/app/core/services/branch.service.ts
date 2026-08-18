import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiSuccessResponse } from '../types/api-response.types';
import type { Branch, PaginatedBranches } from '../types/branch.types';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/branches`;

  getBranches(params?: {
    branchType?: 'MATRIZ' | 'SUCURSAL';
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'createdAt' | 'branchType';
    sortOrder?: 'asc' | 'desc';
  }): Observable<ApiSuccessResponse<PaginatedBranches>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.branchType) httpParams = httpParams.set('branchType', params.branchType);
      if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http.get<ApiSuccessResponse<PaginatedBranches>>(this.baseUrl, { params: httpParams });
  }

  getBranchById(id: string): Observable<ApiSuccessResponse<Branch>> {
    return this.http.get<ApiSuccessResponse<Branch>>(`${this.baseUrl}/${id}`);
  }
}
