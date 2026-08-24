export interface CreateClientDto {
  curp: string;
  firstName: string;
  lastNamePaternal: string;
  lastNameMaternal: string;
  birthDate: string; // YYYY-MM-DD
  rfc?: string;
  street?: string;
  streetNumber?: string;
  colonia?: string;
  postalCode?: string;
  birthPlace?: string;
  state?: string;
  city?: string;
  bankAccount?: {
    clabe: string;
  };
  /**
   * UUID del documento del INE en `app.document`. Se sube primero via
   * `POST /uploads` con `documentType='ine'` y se manda el `id` aqui.
   * El backend valida que exista y lo persiste en `client.ine_document_id`.
   */
  ineDocumentId?: string;
  /** UUID del comprobante de domicilio (misma dinamica que `ineDocumentId`). */
  addressProofDocumentId?: string;
}

export interface TransferClientDto {
  newDistributorId?: string;
  reason: string;
  notes?: string;
}

export interface ClientTransferResponse {
  id: string;
  previousDistributorId: string;
  newDistributorId: string;
}

export interface Client {
  id: string;
  curp: string;
  firstName: string;
  lastNamePaternal: string;
  lastNameMaternal: string;
  fullName: string;
  rfc: string;
  birthDate: string;
  street: string | null;
  streetNumber: string | null;
  colonia: string | null;
  postalCode: string | null;
  birthPlace: string | null;
  state: string | null;
  city: string | null;
  // Campos extra para la UI (asumidos o a la espera de confirmación)
  outstandingCents?: number;
  status?: 'ACTIVO' | 'MOROSO' | 'BLOQUEADO' | string;
}

export interface PaginatedClients {
  data: Client[];
}
