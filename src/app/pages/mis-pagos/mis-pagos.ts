import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { RelationService } from '../../core/services/relation.service';

@Component({
  selector: 'app-mis-pagos',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  templateUrl: './mis-pagos.html',
  styleUrl: './mis-pagos.css',
})
export class MisPagos implements OnInit {
  private readonly relationService = inject(RelationService);
  
  readonly referencePayment = signal<string>('Cargando...');
  readonly isLoading = signal(true);
  readonly relations = signal<any[]>([]);

  ngOnInit() {
    this.relationService.getRelations().subscribe({
      next: (res) => {
        const relations = res.data?.data || [];
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
}
