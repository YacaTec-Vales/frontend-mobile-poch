import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { RelationService } from '../../core/services/relation.service';
import { RelationDetailModal } from './components/relation-detail-modal/relation-detail-modal';

@Component({
  selector: 'app-mis-pagos',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, RelationDetailModal],
  templateUrl: './mis-pagos.html',
  styleUrl: './mis-pagos.css',
})
export class MisPagos implements OnInit {
  private readonly relationService = inject(RelationService);
  
  readonly referencePayment = signal<string>('Cargando...');
  readonly isLoading = signal(true);
  readonly relations = signal<any[]>([]);
  
  selectedRelationId = signal<string | null>(null);

  ngOnInit() {
    this.relationService.getRelations().subscribe({
      next: (res) => {
        const relations = res.data || [];
        if (relations.length > 0) {
          // Tomar la primera relación
          const relationWithRef = relations[0];
          this.referencePayment.set(relationWithRef.referencePayment || 'Sin referencia');
          this.relations.set(relations);
        } else {
          this.referencePayment.set('Sin referencia');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.referencePayment.set('Error al cargar');
        this.isLoading.set(false);
      }
    });
  }

  openRelationDetail(id: string) {
    this.selectedRelationId.set(id);
  }
}
