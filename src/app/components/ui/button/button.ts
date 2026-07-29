import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Tipo de variante del botón.
 */
export type ButtonVariant = 'primary' | 'outline' | 'danger';

/**
 * Tamaño del botón.
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Componente reutilizable para Botones.
 * Sigue el sistema de diseño usando la variable --color-brand.
 * 
 * @description
 * Provee estilos unificados y estados de botón interactivos.
 * 
 * @example
 * <app-button variant="primary" size="lg" (onClick)="save()">Guardar</app-button>
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html'
})
export class ButtonComponent {
  /** Variante de color del botón */
  @Input() variant: ButtonVariant = 'primary';
  
  /** Tamaño del botón (padding y text-size) */
  @Input() size: ButtonSize = 'md';
  
  /** Define si el botón ocupa el 100% del ancho (mobile-friendly) */
  @Input() fullWidth: boolean = false;
  
  /** Estado de deshabilitado */
  @Input() disabled: boolean = false;
  
  /** Define si el botón es tipo submit o button */
  @Input() type: 'button' | 'submit' = 'button';

  /** Evento emitido al hacer clic (si no está deshabilitado) */
  @Output() onClick = new EventEmitter<Event>();

  /**
   * Manejador de clic interno
   * @param event Evento del ratón
   */
  handleClick(event: Event) {
    if (!this.disabled) {
      this.onClick.emit(event);
    } else {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Obtiene las clases CSS dinámicas basadas en las propiedades
   */
  get classes(): string {
    const baseClasses = 'inline-flex items-center justify-center font-bold rounded-xl focus:ring-4 focus:outline-none transition-all duration-200';
    const widthClasses = this.fullWidth ? 'w-full' : '';
    const disabledClasses = this.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 shadow-md active:scale-95';
    
    // Tamaños
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-5 py-3 text-lg',
      xl: 'px-6 py-4 text-xl'
    }[this.size];

    // Variantes de color
    let variantClasses = '';
    if (this.variant === 'primary') {
      variantClasses = 'text-white border-transparent';
      // Usamos style en HTML para asegurar la lectura de var(--color-brand) si es necesario,
      // pero podemos apoyarnos en bg-brand si en tailwind.config está configurado.
      // Usaremos clases genéricas si la config de tailwind lo soporta, o inline style para forzar.
      // En este caso, usamos bg-brand asumiendo integración con flowbite theme.
      variantClasses += ' bg-brand hover:bg-brand-strong focus:ring-brand-300';
    } else if (this.variant === 'outline') {
      variantClasses = 'text-brand bg-transparent border-2 border-brand hover:bg-brand-50 focus:ring-brand-300';
    } else if (this.variant === 'danger') {
      variantClasses = 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 border-transparent';
    }

    return `${baseClasses} ${widthClasses} ${disabledClasses} ${sizeClasses} ${variantClasses}`;
  }
}
