import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CardComponent } from '../../components/ui/card/card';
import { InputComponent } from '../../components/ui/input/input';
import { ButtonComponent } from '../../components/ui/button/button';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { UploadService } from '../../core/services/upload.service';
import { ProductService } from '../../core/services/product.service';
import { VoucherService } from '../../core/services/voucher.service';
import type { CreateClientDto } from '../../core/types/client.types';
import type { Product } from '../../core/types/product.types';

@Component({
  selector: 'app-nuevo-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, CardComponent, InputComponent, ButtonComponent, RouterLink],
  templateUrl: './nuevo-cliente.html',
  styleUrl: './nuevo-cliente.css',
})
export class NuevoCliente implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly uploadService = inject(UploadService);
  private readonly productService = inject(ProductService);
  private readonly voucherService = inject(VoucherService);
  private readonly router = inject(Router);

  // Stepper State
  currentStep = 1;

  // Campos Requeridos Cliente
  firstName = '';
  lastNamePaternal = '';
  lastNameMaternal = '';
  curp = '';
  birthDate = '';

  // Campos Opcionales
  rfc = '';
  street = '';
  streetNumber = '';
  colonia = '';
  postalCode = '';
  state = '';
  city = '';

  // Archivos
  ineFrente?: File;
  ineReverso?: File;

  // Paso 3: Vale
  productId = '';
  clabe = '';
  banco = '';
  readonly products = signal<Product[]>([]);
  readonly isLoadingProducts = signal(true);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products.set(res.data || []);
        this.isLoadingProducts.set(false);
      },
      error: () => this.isLoadingProducts.set(false)
    });
  }

  setStep(step: number) {
    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  // Métodos de sanitización
  sanitizeName(field: 'firstName' | 'lastNamePaternal' | 'lastNameMaternal', value: string) {
    let sanitized = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    sanitized = sanitized.replace(/\s+/g, ' ').slice(0, 100);
    this[field] = sanitized;
  }

  sanitizeCurp(value: string) {
    this.curp = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 18);
  }

  sanitizeRfc(value: string) {
    this.rfc = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 13);
  }

  sanitizePostalCode(value: string) {
    this.postalCode = value.replace(/[^0-9]/g, '').slice(0, 5);
  }

  sanitizeText(field: 'street' | 'colonia' | 'city' | 'state' | 'streetNumber', value: string, maxLength: number) {
    let sanitized = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.,-]/g, '');
    sanitized = sanitized.replace(/\s+/g, ' ').slice(0, maxLength);
    this[field] = sanitized;
  }

  nextStep() {
    this.errorMessage.set('');
    if (this.currentStep === 1) {
      if (!this.firstName || !this.lastNamePaternal || !this.lastNameMaternal || !this.curp || !this.birthDate) {
        this.errorMessage.set('Completa los campos requeridos (Nombre, Apellidos, CURP, Fecha).');
        return;
      }
      if (this.curp.length !== 18) {
        this.errorMessage.set('La CURP debe tener exactamente 18 caracteres alfanuméricos.');
        return;
      }
      if (this.rfc && (this.rfc.length < 10 || this.rfc.length > 13)) {
        this.errorMessage.set('El RFC debe tener entre 10 y 13 caracteres alfanuméricos.');
        return;
      }
      if (this.postalCode && this.postalCode.length !== 5) {
        this.errorMessage.set('El Código Postal debe tener exactamente 5 dígitos.');
        return;
      }
    }
    this.currentStep++;
  }

  prevStep() {
    this.errorMessage.set('');
    this.currentStep--;
  }

  onFileSelected(event: any, side: 'frente' | 'reverso') {
    const file = event.target.files[0];
    if (file) {
      if (side === 'frente') this.ineFrente = file;
      if (side === 'reverso') this.ineReverso = file;
    }
  }

  finalizarRegistro() {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.productId) {
      this.errorMessage.set('Selecciona un producto para el prevale.');
      return;
    }

    if (!this.banco || !this.clabe) {
      this.errorMessage.set('Completa los datos bancarios (Banco y CLABE).');
      return;
    }

    if (this.clabe.length !== 18) {
      this.errorMessage.set('La CLABE debe tener exactamente 18 dígitos.');
      return;
    }
    
    this.isLoading.set(true);
    this.successMessage.set('Registrando cliente...');

    const clientDto: CreateClientDto = {
      firstName: this.firstName.trim(),
      lastNamePaternal: this.lastNamePaternal.trim(),
      lastNameMaternal: this.lastNameMaternal.trim(),
      curp: this.curp.trim().toUpperCase(),
      birthDate: this.birthDate.trim(),
      rfc: this.rfc.trim().toUpperCase() || undefined,
      street: this.street.trim() || undefined,
      streetNumber: this.streetNumber.trim() || undefined,
      colonia: this.colonia.trim() || undefined,
      postalCode: this.postalCode.trim() || undefined,
      state: this.state.trim() || undefined,
      city: this.city.trim() || undefined,
      bankAccount: {
        clabe: this.clabe.trim(),
        banco: this.banco.trim()
      }
    };

    this.clientService.createClient(clientDto).subscribe({
      next: (clientRes) => {
        const clientId = clientRes.data.id;
        this.successMessage.set('Subiendo documentos...');
        
        const uploadTasks = [];
        if (this.ineFrente) {
          uploadTasks.push(this.uploadService.uploadDocument(this.ineFrente, 'ine', JSON.stringify({ clientId, side: 'frente' })).pipe(catchError(() => of(null))));
        }
        if (this.ineReverso) {
          uploadTasks.push(this.uploadService.uploadDocument(this.ineReverso, 'ine', JSON.stringify({ clientId, side: 'reverso' })).pipe(catchError(() => of(null))));
        }

        const executeVoucher = () => {
          this.successMessage.set('Generando prevale...');
          this.voucherService.create({
            clientId: clientId,
            productId: this.productId
          }).subscribe({
            next: (voucherRes) => {
              this.isLoading.set(false);
              this.successMessage.set('¡Alta y Prevale generados con éxito!');
              setTimeout(() => this.router.navigate(['/mi-cartera']), 2000);
            },
            error: (err: HttpErrorResponse) => {
              this.isLoading.set(false);
              this.errorMessage.set(err.error?.message || 'Ocurrió un error al generar el prevale.');
            }
          });
        };

        if (uploadTasks.length > 0) {
          forkJoin(uploadTasks).subscribe({
            next: () => executeVoucher(),
            error: () => executeVoucher()
          });
        } else {
          executeVoucher();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Ocurrió un error al crear el cliente.');
      }
    });
  }
}
