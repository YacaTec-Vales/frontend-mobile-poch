import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

/**
 * Componente reutilizable para Entradas de Texto (Inputs).
 * Implementa ControlValueAccessor para soporte completo de formularios reactivos y ngModel.
 * 
 * @description
 * Provee un diseño unificado para campos de texto, con soporte para iconos
 * nativos de Flowbite (SVGs pasados por transclusión) y manejo de estados.
 * 
 * @example
 * <app-input label="CURP" placeholder="Ej. AAAA000000..." [(ngModel)]="curp"></app-input>
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  host: {
    class: 'block w-full border-0 p-0 bg-transparent ring-0 shadow-none'
  }
})
export class InputComponent implements ControlValueAccessor {
  /** Etiqueta descriptiva del campo */
  @Input() label: string = '';
  
  /** Texto temporal de ayuda */
  @Input() placeholder: string = '';
  
  /** Tipo de campo (text, password, email, number) */
  @Input() type: string = 'text';
  
  /** ID único, si no se provee se genera uno automático */
  @Input() id: string = `input-${Math.random().toString(36).substr(2, 9)}`;
  
  /** Mensaje de error a mostrar (el borde se vuelve rojo si existe) */
  @Input() error: string = '';
  
  /** Indica si tiene un ícono que se pasará como ng-content */
  @Input() hasIcon: boolean = false;
  
  /** Estado de deshabilitado */
  @Input() disabled: boolean = false;

  /** Regex para filtrar caracteres no deseados en tiempo real. Ej: '[^a-zA-Z]' */
  @Input() filterRegex?: string;

  /** Forzar el texto a mayúsculas en tiempo real */
  @Input() uppercase: boolean = false;

  /** Longitud máxima permitida */
  @Input() maxLength?: number;

  // Valor interno
  value: any = '';

  // Callbacks de ControlValueAccessor
  onChange = (val: any) => {};
  onTouched = () => {};

  /**
   * Actualiza el valor interno cuando el modelo cambia externamente
   */
  writeValue(value: any): void {
    this.value = value;
  }

  /**
   * Registra el callback para notificar cambios en la vista
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Registra el callback cuando el campo es tocado
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Deshabilita el componente si Angular lo requiere
   */
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Maneja el input event
   */
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let newValue = target.value;

    if (this.filterRegex) {
      const regex = new RegExp(this.filterRegex, 'g');
      newValue = newValue.replace(regex, '');
    }

    if (this.uppercase) {
      newValue = newValue.toUpperCase();
    }

    // Actualizamos el DOM directamente para prevenir desincronización de la vista
    if (target.value !== newValue) {
      target.value = newValue;
    }

    this.value = newValue;
    this.onChange(this.value);
  }
}
