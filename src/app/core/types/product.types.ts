export interface Product {
  id: string;
  code: string;
  variant: 'NORMAL' | 'PLUS' | string;
  costCents: number;
  totalPeriods: number;
  commissionBps: number;
  insuranceCents: number;
  interestPerPeriodBps: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
