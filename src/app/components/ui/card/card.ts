import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente reutilizable para Tarjetas (Cards).
 * 
 * @description
 * Provee un contenedor estandarizado con sombras, bordes redondeados
 * y soporte opcional para títulos y padding ajustado.
 * 
 * @example
 * <app-card title="Límite de Crédito" [noPadding]="false">
 *   <p>$10,000.00</p>
 * </app-card>
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html'
})
export class CardComponent {
  /** Título principal de la tarjeta (opcional) */
  @Input() title: string = '';
  
  /** Subtítulo o texto secundario bajo el título (opcional) */
  @Input() subtitle: string = '';
  
  /** Si es true, elimina el padding interno para contenido completo (como imágenes o listas) */
  @Input() noPadding: boolean = false;
  
  /** Clases adicionales para inyectar al contenedor base */
  @Input() extraClasses: string = '';
}
