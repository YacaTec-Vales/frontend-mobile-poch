import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Componente reutilizable para Búsqueda (Search Bar).
 * 
 * @description
 * Provee un input con ícono de lupa estilizado y emisión de eventos automáticos
 * al realizar una búsqueda.
 * 
 * @example
 * <app-search-bar placeholder="Buscar cliente por nombre..." (onSearch)="buscar($event)"></app-search-bar>
 */
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html'
})
export class SearchBarComponent {
  /** Placeholder para el input de búsqueda */
  @Input() placeholder: string = 'Buscar...';
  
  /** Valor inicial de la búsqueda */
  @Input() initialValue: string = '';

  /** Emite el string de búsqueda cuando el usuario interactúa */
  @Output() onSearch = new EventEmitter<string>();

  /**
   * Manejador invocado por el (input)
   */
  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onSearch.emit(target.value);
  }

  /**
   * Limpia el campo de búsqueda y emite un string vacío
   */
  clearSearch(): void {
    this.initialValue = '';
    this.onSearch.emit('');
  }
}
