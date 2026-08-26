import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiSuccessResponse } from '../types/api-response.types';

export interface UploadResponse {
  id: string;
  documentType: string;
  fileName: string;
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  sizeBytes: number;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/uploads`;

  uploadDocument(file: File, documentType: 'ine' | 'address_proof' | 'voucher_evidence' | 'other', metadata?: string): Observable<ApiSuccessResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (metadata) {
      formData.append('metadata', metadata);
    }

    return this.http.post<ApiSuccessResponse<UploadResponse>>(this.baseUrl, formData);
  }
}
