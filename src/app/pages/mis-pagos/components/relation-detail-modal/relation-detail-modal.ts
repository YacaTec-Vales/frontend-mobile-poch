import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RelationService } from '../../../../core/services/relation.service';
import type { Relation } from '../../../../core/types/relation.types';

@Component({
  selector: 'app-relation-detail-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './relation-detail-modal.html',
})
export class RelationDetailModal {
  relationId = input.required<string>();
  close = output<void>();

  private relationService = inject(RelationService);

  relation = signal<Relation | null>(null);
  isLoading = signal(true);
  error = signal<string>('');

  constructor() {
    effect(() => {
      const id = this.relationId();
      if (id) {
        this.fetchRelationDetails(id);
      }
    }, { allowSignalWrites: true });
  }

  private fetchRelationDetails(id: string) {
    this.isLoading.set(true);
    this.error.set('');
    this.relation.set(null);

    this.relationService.getRelationById(id).subscribe({
      next: (res) => {
        this.relation.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar los detalles de la relación.');
        this.isLoading.set(false);
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}
