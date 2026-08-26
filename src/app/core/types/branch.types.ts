export interface BranchManager {
  id: string;
  firstName: string;
  lastNamePaternal: string;
  email: string;
}

export interface Branch {
  id: string;
  name: string;
  branchType: 'MATRIZ' | 'SUCURSAL';
  esMatriz: boolean;
  address: string | null;
  managerUserId: string | null;
  manager: BranchManager | null;
  cutoffDay: number | null;
  paymentDay: number | null;
  earlyPaymentDays: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedBranches {
  data: Branch[];
  // Podrían venir más campos de paginación como total, page, etc. según el estándar de la API
}
