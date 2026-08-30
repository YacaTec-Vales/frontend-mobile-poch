import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { validateDescription, validateReason } from '../../core/validators/form-validators';

type TipoReclamo = 'CLIENTE' | 'APP' | 'CUENTA' | 'OTRO';

interface ReclamoLocal {
  id: string;
  tipo: TipoReclamo;
  descripcion: string;
  fecha: string; // ISO
}

const STORAGE_KEY = 'yacatec.reclamos.local.v1';

@Component({
  selector: 'app-reclamos',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  templateUrl: './reclamos.html'
})
export class Reclamos implements OnInit {
  readonly tipo = signal<TipoReclamo>('CLIENTE');
  readonly descripcion = signal('');
  readonly evidenciaNombre = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly isSubmitting = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly descripcionError = computed(() => {
    if (!this.submitted()) return '';
    return validateDescription(this.descripcion(), 20, 1000, 'descripcion');
  });

  readonly tipoError = computed(() => {
    if (!this.submitted()) return '';
    if (!this.tipo()) return 'Selecciona un tipo de reclamo.';
    return '';
  });

  readonly canSubmit = computed(() => {
    return (
      !this.descripcionError() &&
      !this.tipoError() &&
      this.descripcion().trim().length > 0 &&
      !!this.tipo() &&
      !this.isSubmitting()
    );
  });

  readonly reclamosRecientes = signal<ReclamoLocal[]>([]);

  ngOnInit() {
    this.loadReclamos();
  }

  private loadReclamos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ReclamoLocal[];
      if (Array.isArray(parsed)) this.reclamosRecientes.set(parsed);
    } catch {
      // localStorage corrupto: ignorar.
    }
  }

  private saveReclamos(list: ReclamoLocal[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Sin cuota o sin permisos: ignorar (no bloquea el submit).
    }
  }

  onTipoChange(value: string) {
    this.tipo.set((value || 'OTRO') as TipoReclamo);
  }

  onDescripcionChange(value: string) {
    // Limitar a 1000 chars en UI aunque el validator tambien lo haga.
    this.descripcion.set((value || '').slice(0, 1000));
  }

  onEvidenciaSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;
    if (file) {
      // Validar tamano: 5 MB max.
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('La imagen no puede pesar mas de 5 MB.');
        this.evidenciaNombre.set(null);
        input.value = '';
        return;
      }
      this.evidenciaNombre.set(file.name);
      this.errorMessage.set('');
    } else {
      this.evidenciaNombre.set(null);
    }
  }

  clearEvidencia() {
    this.evidenciaNombre.set(null);
  }

  onSubmit() {
    this.submitted.set(true);
    this.errorMessage.set('');
    if (!this.canSubmit()) {
      this.errorMessage.set(
        this.descripcionError() || this.tipoError() || 'Corrige los errores antes de enviar.',
      );
      return;
    }

    this.isSubmitting.set(true);

    // Modo demo: el backend no tiene endpoint de reclamos.
    // Persistimos localStorage para que "Mis Reclamos Recientes" muestre el envio.
    const nuevo: ReclamoLocal = {
      id: 'RC-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      tipo: this.tipo(),
      descripcion: this.descripcion().trim(),
      fecha: new Date().toISOString(),
    };

    setTimeout(() => {
      const list = [nuevo, ...this.reclamosRecientes()].slice(0, 10);
      this.reclamosRecientes.set(list);
      this.saveReclamos(list);

      this.successMessage.set(
        `Reclamo ${nuevo.id} registrado. Recibiras seguimiento por correo electronico.`,
      );
      this.isSubmitting.set(false);

      // Reset
      this.tipo.set('CLIENTE');
      this.descripcion.set('');
      this.evidenciaNombre.set(null);
      this.submitted.set(false);

      setTimeout(() => this.successMessage.set(''), 6000);
    }, 600); // pequeño delay para simular POST y mostrar spinner.
  }

  /** Texto legible del tipo de reclamo para mostrar en la lista. */
  tipoLabel(t: TipoReclamo): string {
    switch (t) {
      case 'CLIENTE': return 'Problema con un cliente';
      case 'APP': return 'Fallo en la aplicacion';
      case 'CUENTA': return 'Duda con mi estado de cuenta';
      case 'OTRO': return 'Otro';
    }
  }

  /** Tiempo relativo: "Hace X minutos/horas/dias". */
  tiempoRelativo(iso: string): string {
    const fecha = new Date(iso);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const seg = Math.floor(diffMs / 1000);
    if (seg < 60) return 'Hace un momento';
    const min = Math.floor(seg / 60);
    if (min < 60) return `Hace ${min} min`;
    const horas = Math.floor(min / 60);
    if (horas < 24) return `Hace ${horas} h`;
    const dias = Math.floor(horas / 24);
    if (dias === 1) return 'Hace 1 dia';
    if (dias < 30) return `Hace ${dias} dias`;
    return fecha.toLocaleDateString('es-MX');
  }
}
