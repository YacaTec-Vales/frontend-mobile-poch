export interface CreateVoucherDto {
  clientId: string;
  productId: string;
  }

export interface VoucherResponse {
  id: string;
  folio: string;
  voucherType: 'PREVALE' | 'DIGITAL';
  status: string;
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
