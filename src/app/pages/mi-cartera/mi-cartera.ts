import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SearchBarComponent } from '../../components/ui/search-bar/search-bar';
import { CardComponent } from '../../components/ui/card/card';
import { ClientService } from '../../core/services/client.service';
import type { Client } from '../../core/types/client.types';

@Component({
  selector: 'app-mi-cartera',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, CardComponent, CurrencyPipe],
  templateUrl: './mi-cartera.html',
  styleUrl: './mi-cartera.css',
})
export class MiCartera implements OnInit {
  private readonly clientService = inject(ClientService);

  readonly clients = signal<Client[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  
  searchTerm = signal('');

  readonly filteredClients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.clients();
    return this.clients().filter(c => 
      c.fullName.toLowerCase().includes(term) || 
      c.id.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.clientService.getMyClients({ limit: 100 }).subscribe({
      next: (res) => {
        this.clients.set(res.data.data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('No se pudo cargar la lista de clientes.');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
  }

  getInitials(name: string, lastName: string): string {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}
