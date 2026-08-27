import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CardComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { InputComponent } from '../../components/ui/input/input';
import { VoucherService } from '../../core/services/voucher.service';
import { ClientService } from '../../core/services/client.service';
import { ProductService } from '../../core/services/product.service';
import type { CreateVoucherDto, VoucherResponse } from '../../core/types/voucher.types';
import type { ApiErrorResponse } from '../../core/types/api-response.types';
import type { Client } from '../../core/types/client.types';
import type { Product } from '../../core/types/product.types';

@Component({
  selector: 'app-vale-digital',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, CardComponent, ButtonComponent, InputComponent],
  templateUrl: './vale-digital.html',
  styleUrl: './vale-digital.css',
})
export class ValeDigital implements OnInit {
  private readonly voucherService = inject(VoucherService);
  private readonly clientService = inject(ClientService);
  private readonly productService = inject(ProductService);

  readonly clients = signal<Client[]>([]);
  readonly isLoadingClients = signal(true);

  readonly products = signal<Product[]>([]);
  readonly isLoadingProducts = signal(true);

  clientId = '';
  productId = '';
  
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly generatedVoucher = signal<VoucherResponse | null>(null);

  ngOnInit() {
    this.clientService.getMyClients({ limit: 100 }).subscribe({
      next: (res) => {
        this.clients.set(res.data.data || []);
        this.isLoadingClients.set(false);
      },
      error: () => {
        this.isLoadingClients.set(false);
      }
    });

    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products.set(res.data || []);
        this.isLoadingProducts.set(false);
      },
      error: () => {
        this.isLoadingProducts.set(false);
      }
    });
  }

  generarFolio() {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.generatedVoucher.set(null);

    if (!this.clientId || !this.productId) {
      this.errorMessage.set('Por favor ingresa el ID del Cliente y el ID del Producto para probar.');
      return;
    }

    
    
    const selectedProduct = this.products().find(p => p.id === this.productId);
    if (!selectedProduct) {
      this.errorMessage.set('El producto seleccionado no es válido.');
      return;
    }

    this.isLoading.set(true);

    const dto: CreateVoucherDto = {
      clientId: this.clientId.trim(),
      productId: this.productId.trim()
    };


    this.voucherService.create(dto).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message);
        this.generatedVoucher.set(res.data);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const body = err.error as ApiErrorResponse | undefined;
        this.errorMessage.set(body?.message || 'Ocurrió un error al generar el vale.');
      }
    });
  }
}
