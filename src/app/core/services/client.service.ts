import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiSuccessResponse } from '../types/api-response.types';
import type { TransferClientDto, ClientTransferResponse, PaginatedClients, CreateClientDto, Client } from '../types/client.types';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/clients`;

  createClient(dto: CreateClientDto): Observable<ApiSuccessResponse<Client>> {
    return this.http.post<ApiSuccessResponse<Client>>(this.baseUrl, dto);
  }

  getMyClients(params?: { page?: number; limit?: number; sortOrder?: 'asc' | 'desc' }): Observable<ApiSuccessResponse<PaginatedClients>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page);
      if (params.limit) httpParams = httpParams.set('limit', params.limit);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    return this.http.get<ApiSuccessResponse<PaginatedClients>>(this.baseUrl, { params: httpParams });
  }

  getClientById(id: string): Observable<ApiSuccessResponse<Client>> {
    return this.http.get<ApiSuccessResponse<Client>>(`${this.baseUrl}/${id}`);
  }

  transferDistributor(clientId: string, dto: TransferClientDto): Observable<ApiSuccessResponse<ClientTransferResponse>> {
    // El backend ahora recibe el clientId dentro del body y la URL ya no lo lleva en el path
    const payload = {
      clientId,
      ...dto
    };
    return this.http.post<ApiSuccessResponse<ClientTransferResponse>>(`${this.baseUrl}/transfer-distributor`, payload);
  }
}
