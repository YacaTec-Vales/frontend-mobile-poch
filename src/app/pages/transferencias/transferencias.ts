import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { CardComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { InputComponent } from '../../components/ui/input/input';
import { ClientService } from '../../core/services/client.service';
import { DistribuidorService } from '../../core/services/distribuidor.service';
import type { TransferClientDto, Client } from '../../core/types/client.types';
import type { Distribuidor } from '../../core/types/distribuidor.types';

@Component({
  selector: 'app-transferencias',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, InputComponent],
  templateUrl: './transferencias.html',
  styleUrl: './transferencias.css',
})
export class Transferencias implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly distribuidorService = inject(DistribuidorService);

  // Listas
  readonly clients = signal<Client[]>([]);
  readonly distribuidores = signal<Distribuidor[]>([]);
  readonly isLoadingData = signal(true);
  
  // Variables de formulario
  isFormVisible = signal(false);
  clientId = '';
    reason = '';
  notes = '';

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  ngOnInit() {
    // Cargar clientes
    this.clientService.getMyClients({ limit: 100 }).subscribe({
      next: (res) => {
        this.clients.set(res.data.data || []);
        // Si ya cargaron las distribuidoras (o si fallaron pero esto terminó), quitamos el loading.
        // Lo ideal es tener un loading separado pero por ahora lo apagamos aquí para que el select de clientes se habilite.
        this.isLoadingData.set(false);
      },
      error: () => {
        this.isLoadingData.set(false);
        this.errorMessage.set('Error al cargar la lista de clientes.');
      }
    });

    // Cargar distribuidoras
    this.distribuidorService.getDistribuidores({ limit: 100 }).subscribe({
      next: (res) => {
        this.distribuidores.set(res.data.data || []);
      },
      error: (err) => {
        // No bloqueamos la UI principal, pero lo logueamos o mostramos un pequeño aviso
        console.error('Error cargando distribuidoras:', err);
      }
    });
  }

  
  solicitarTransferencia() {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.clientId.trim() || !this.reason.trim()) {
      this.errorMessage.set('Completa todos los campos obligatorios.');
      return;
    }

    this.isLoading.set(true);

    const dto: TransferClientDto = {
            reason: this.reason.trim(),
      notes: this.notes.trim() || undefined
    };

    this.clientService.transferDistributor(this.clientId.trim(), dto).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set('Solicitud de transferencia enviada a Coordinación.');
        this.clientId = '';
                this.reason = '';
        this.notes = '';
        setTimeout(() => {
          this.isFormVisible.set(false);
          this.successMessage.set('');
        }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        // Mostrar el error real de la API
        this.errorMessage.set(err.error?.message || 'Error al procesar la solicitud.');
      }
    });
  }
}
