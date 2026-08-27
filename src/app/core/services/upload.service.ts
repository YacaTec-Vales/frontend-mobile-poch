import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiSuccessResponse } from '../types/api-response.types';

/**
 * Documento del modulo `app.document`. Mismo shape que el backend
 * (`DocumentResponseDto`). La `publicUrl` viene firmada SigV4 con TTL
 * de 15 min; cuando expira el frontend debe re-fetchear por `id`.
 */
export interface UploadResponse {
  id: string;
  documentType: string;
  fileName: string;
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string | null;
  uploadedBy: string;
  metadata: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

/** Tipos de documento conocidos por el backend. */
export type KnownDocumentType =
  | 'ine'
  | 'address_proof'
  | 'voucher_evidence'
  | 'conciliacion_evidence'
  | 'photo_verification'
  | 'other'
  | string;

/**
 * Servicio de uploads/documentos para el frontend Poch.
 *
 * Endpoints consumidos (`${apiUrl}/uploads`):
 *  - POST /                          subir archivo generico
 *  - POST /verification/:solicitanteId  subir foto de verificacion
 *  - GET  /:id                       metadata + URL firmada
 *  - GET  /client/:clientId          documentos del cliente
 *  - GET  /verification/:solicitanteId  documentos de una verificacion
 *  - GET  /type/:documentType        documentos por tipo
 *
 * Ver `docs/uploads-api-frontends.md` en el backend para el contrato
 * completo y el manejo de URLs expiradas.
 */
@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/uploads`;

  uploadDocument(
    file: File,
    documentType: 'ine' | 'address_proof' | 'voucher_evidence' | 'other',
    metadata?: string,
  ): Observable<ApiSuccessResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (metadata) {
      formData.append('metadata', metadata);
    }
    return this.http.post<ApiSuccessResponse<UploadResponse>>(this.baseUrl, formData);
  }

  uploadForVerification(
    solicitationId: string,
    file: File,
    documentType: KnownDocumentType,
  ): Observable<ApiSuccessResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return this.http.post<ApiSuccessResponse<UploadResponse>>(
      `${this.baseUrl}/verification/${solicitationId}`,
      formData,
    );
  }

  /** GET /uploads/:id -> UploadResponse */
  getById(id: string): Observable<UploadResponse> {
    return this.http
      .get<ApiSuccessResponse<UploadResponse>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  /** GET /uploads/verification/:solicitationId */
  getDocumentsByVerification(solicitationId: string): Observable<UploadResponse[]> {
    return this.http
      .get<ApiSuccessResponse<UploadResponse[]>>(`${this.baseUrl}/verification/${solicitationId}`)
      .pipe(map((res) => res.data ?? []));
  }

  /** GET /uploads/client/:clientId */
  getDocumentsByClient(clientId: string): Observable<UploadResponse[]> {
    return this.http
      .get<ApiSuccessResponse<UploadResponse[]>>(`${this.baseUrl}/client/${clientId}`)
      .pipe(map((res) => res.data ?? []));
  }

  /** GET /uploads/type/:documentType */
  getDocumentsByType(documentType: KnownDocumentType): Observable<UploadResponse[]> {
    return this.http
      .get<ApiSuccessResponse<UploadResponse[]>>(`${this.baseUrl}/type/${documentType}`)
      .pipe(map((res) => res.data ?? []));
  }

  isImage(mime: string): boolean {
    return mime?.startsWith('image/');
  }

  isPdf(mime: string): boolean {
    return mime === 'application/pdf';
  }
}