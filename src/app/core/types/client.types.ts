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
    banco?: string;
  };
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

export interface Voucher {
  id: string;
  folio: string;
  voucherType: string;
  status: 'ACTIVO' | 'CANCELADO' | 'LIQUIDADO' | string;
  productId: string;
  distributorId: string;
  clientId: string;
  amountCents: number;
  paidPeriods: number;
  totalPeriods: number;
  totalToPayCents: number;
  paymentPerPeriodCents: number;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
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
  outstandingCents?: number;
  status?: 'ACTIVO' | 'MOROSO' | 'BLOQUEADO' | string;
  vouchers?: Voucher[];
}

export interface PaginatedClients {
  data: Client[];
}
