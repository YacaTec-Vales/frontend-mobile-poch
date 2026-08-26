import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../types/api-response.types';
import { Relation } from '../types/relation.types';

@Injectable({
  providedIn: 'root'
})
export class RelationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/relations`;

  getRelations(): Observable<ApiSuccessResponse<Relation[]>> {
    return this.http.get<ApiSuccessResponse<Relation[]>>(this.baseUrl);
  }

  getRelationById(id: string): Observable<ApiSuccessResponse<any>> {
    return this.http.get<ApiSuccessResponse<any>>(`${this.baseUrl}/${id}`);
  }
}
