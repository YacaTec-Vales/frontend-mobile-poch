import { Component, input, output, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ClientService } from '../../../../core/services/client.service';
import { VoucherService } from '../../../../core/services/voucher.service';
import { FormsModule } from '@angular/forms';
import type { Client } from '../../../../core/types/client.types';
import { validateReason } from '../../../../core/validators/form-validators';

@Component({
  selector: 'app-client-detail-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, FormsModule],
  templateUrl: './client-detail-modal.html',
})
export class ClientDetailModal {
  clientId = input.required<string>();
  close = output<void>();

  private clientService = inject(ClientService);
  private voucherService = inject(VoucherService);

  client = signal<Client | null>(null);
  isLoading = signal(true);
  error = signal<string>('');
  activeTab = signal<'detalles' | 'vales'>('detalles');
  
  // Cancellation state
  cancelingFolio = signal<string | null>(null);
  cancelReason = signal('');
  isCanceling = signal(false);
  cancelError = signal('');
  readonly submittedCancel = signal(false);

  readonly cancelReasonError = computed(() => {
    if (!this.submittedCancel()) return '';
    return validateReason(this.cancelReason(), 10, 500, 'motivo de cancelacion');
  });

  readonly canConfirmCancel = computed(() => !this.cancelReasonError() && this.cancelReason().trim().length > 0);

  protected readonly Math = Math;

  constructor() {
    effect(() => {
      const id = this.clientId();
      if (id) {
        this.fetchClientDetails(id);
      }
    }, { allowSignalWrites: true });
  }

  private fetchClientDetails(id: string) {
    this.isLoading.set(true);
    this.error.set('');
    this.client.set(null);

    this.clientService.getClientById(id).subscribe({
      next: (res) => {
        this.client.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar los detalles del cliente.');
        this.isLoading.set(false);
      }
    });
  }

  startCancellation(folio: string) {
    this.cancelingFolio.set(folio);
    this.cancelReason.set('');
    this.cancelError.set('');
    this.submittedCancel.set(false);
  }

  cancelCancellation() {
    this.cancelingFolio.set(null);
    this.cancelReason.set('');
    this.cancelError.set('');
    this.submittedCancel.set(false);
  }

  confirmCancellation(folio: string) {
    this.submittedCancel.set(true);
    if (!this.canConfirmCancel()) {
      this.cancelError.set(this.cancelReasonError());
      return;
    }

    this.isCanceling.set(true);
    this.cancelError.set('');

    this.voucherService.cancelVoucher(folio, this.cancelReason()).subscribe({
      next: () => {
        this.isCanceling.set(false);
        this.cancelCancellation();
        // Refresh client to see the updated voucher status
        this.fetchClientDetails(this.clientId());
      },
      error: (err) => {
        this.isCanceling.set(false);
        this.cancelError.set(err.error?.message || 'Error al cancelar el vale.');
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}
