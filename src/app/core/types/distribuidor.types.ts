export interface DistribuidorStatus {
  id: string;
  distributorNumber: string;
  fullName: string;
  categoryName: string;
  branchName: string;
  status: 'ACTIVA' | 'MOROSA' | 'DESHABILITADA' | 'BAJA_VOLUNTARIA';
  creditLimitCents: number;
  creditAvailableCents: number;
  outstandingCents: number;
  nextCutDate: string | null;
  delinquentRelationsCount: number;
  pendingRelationsCents: number;
  pointsBalance: number;
  createdAt: string;
  activatedAt: string | null;
}

export interface CreateCreditRaiseDto {
  montoCentavos: number;
  motivo: string;
}

export interface CreditRaiseRequest {
  id: string;
  distributorId: string;
  branchId: string;
  fromCreditLimitCents: number;
  requestedAmountCents: number;
  approvedAmountCents: number | null;
  toCreditLimitCents: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: string;
  decidedBy: string | null;
  reason: string;
  decisionNotes: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface Distribuidor {
  id: string;
  distributorNumber: string;
  creditLimitCents: number;
  creditAvailableCents: number;
  status: string;
  generalData?: {
    firstName?: string;
    lastNamePaternal?: string;
    lastNameMaternal?: string;
  };
}

export interface PaginatedDistribuidores {
  data: Distribuidor[];
}
