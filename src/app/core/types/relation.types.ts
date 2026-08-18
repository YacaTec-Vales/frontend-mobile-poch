export interface Relation {
  id: string;
  referencePayment: string;
  distributorId: string;
  cutDate: string;
  paymentDeadlineDate: string;
  totalToPayCents: number;
  totalPaidCents: number;
  totalCommissionCents: number;
  totalPaymentCents: number;
  totalPenaltiesCents: number;
  remainingCents: number;
  reconciliationStatus: string;
  pointsAtCut: number;
  createdAt: string;
}

export interface PaginatedRelations {
  data: Relation[];
}
