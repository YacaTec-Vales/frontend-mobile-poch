import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of, timer } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CardComponent } from '../../components/ui/card/card';
import { InputComponent } from '../../components/ui/input/input';
import { ButtonComponent } from '../../components/ui/button/button';
import { ClientService } from '../../core/services/client.service';
import { UploadService } from '../../core/services/upload.service';
import { ProductService } from '../../core/services/product.service';
import { VoucherService } from '../../core/services/voucher.service';
import type { CreateClientDto } from '../../core/types/client.types';
import type { Product } from '../../core/types/product.types';
import {
  validateName,
  validateCurp,
  validateRfc,
  validateBirthDate,
  validatePostalCode,
  validateBankName,
  validateClabe,
} from '../../core/validators/form-validators';

/**
 * Wizard de alta de cliente + generacion de prevale.
 * Validacion: usa `core/validators/form-validators.ts` para reflejar
 * la politica del backend. Errores por campo via `[error]` en app-input.
 */
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
  private readonly destroyRef = inject(DestroyRef);

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

  /** Habilita mostrar errores por campo tras submit del step. */
  readonly submittedStep1 = signal(false);
  readonly submittedStep3 = signal(false);

  // ---- Errores Step 1 (datos personales + direccion) ----
  readonly firstNameError = computed(() => {
    if (!this.submittedStep1()) return '';
    return validateName(this.firstName, 'nombre');
  });

  readonly lastNamePaternalError = computed(() => {
    if (!this.submittedStep1()) return '';
    return validateName(this.lastNamePaternal, 'apellido paterno');
  });

  readonly lastNameMaternalError = computed(() => {
    if (!this.submittedStep1()) return '';
    return validateName(this.lastNameMaternal, 'apellido materno');
  });

  readonly curpError = computed(() => {
    if (!this.submittedStep1()) return '';
    return validateCurp(this.curp, 'CURP');
  });

  readonly birthDateError = computed(() => {
    if (!this.submittedStep1()) return '';
    return validateBirthDate(this.birthDate);
  });

  readonly rfcError = computed(() => {
    if (!this.submittedStep1()) return '';
    if (!this.rfc) return ''; // opcional
    return validateRfc(this.rfc, 'RFC');
  });

  readonly postalCodeError = computed(() => {
    if (!this.submittedStep1()) return '';
    if (!this.postalCode) return ''; // opcional
    return validatePostalCode(this.postalCode, 'codigo postal');
  });

  readonly canGoToStep2 = computed(() => {
    return (
      !this.firstNameError() &&
      !this.lastNamePaternalError() &&
      !this.lastNameMaternalError() &&
      !this.curpError() &&
      !this.birthDateError() &&
      !this.rfcError() &&
      !this.postalCodeError() &&
      this.firstName.trim().length > 0 &&
      this.lastNamePaternal.trim().length > 0 &&
      this.lastNameMaternal.trim().length > 0 &&
      this.curp.length === 18 &&
      this.birthDate.length > 0
    );
  });

  // ---- Errores Step 3 (vale + banco) ----
  readonly productIdError = computed(() => {
    if (!this.submittedStep3()) return '';
    if (!this.productId) return 'Selecciona un producto para el prevale.';
    return '';
  });

  readonly bancoError = computed(() => {
    if (!this.submittedStep3()) return '';
    return validateBankName(this.banco);
  });

  readonly clabeError = computed(() => {
    if (!this.submittedStep3()) return '';
    return validateClabe(this.clabe, 'CLABE interbancaria');
  });

  readonly canFinalize = computed(() => {
    return (
      !this.productIdError() &&
      !this.bancoError() &&
      !this.clabeError() &&
      !!this.productId &&
      !!this.banco &&
      this.clabe.length === 18
    );
  });

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products.set(res.data || []);
        this.isLoadingProducts.set(false);
      },
      error: () => this.isLoadingProducts.set(false),
    });
  }

  setStep(step: number) {
    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  // Métodos de sanitización (siguen aplicando los regex de UI para
  // que el usuario no pueda pegar caracteres no validos).
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

  sanitizeBanco(value: string) {
    let sanitized = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    sanitized = sanitized.replace(/\s+/g, ' ').slice(0, 80);
    this.banco = sanitized;
  }

  sanitizeClabe(value: string) {
    this.clabe = value.replace(/[^0-9]/g, '').slice(0, 18);
  }

  nextStep() {
    this.errorMessage.set('');
    this.submittedStep1.set(true);

    if (!this.canGoToStep2()) {
      return;
    }

    this.currentStep++;
    this.submittedStep1.set(false); // reset para el siguiente step
  }

  prevStep() {
    this.errorMessage.set('');
    this.currentStep--;
    this.submittedStep1.set(false);
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
    this.submittedStep3.set(true);

    if (!this.canFinalize()) {
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
        banco: this.banco.trim(),
      },
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
            productId: this.productId,
          }).subscribe({
            next: () => {
              this.isLoading.set(false);
              this.successMessage.set('¡Alta y Prevale generados con exito!');
              // BUG FIX 2026-08-31: takeUntilDestroyed cancela el redirect si el
              // componente se destruye antes de los 2s.
              timer(2000)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.router.navigate(['/mi-cartera']));
            },
            error: (err: HttpErrorResponse) => {
              this.isLoading.set(false);
              this.errorMessage.set(err.error?.message || 'Ocurrio un error al generar el prevale.');
            },
          });
        };

        if (uploadTasks.length > 0) {
          forkJoin(uploadTasks).subscribe({
            next: () => executeVoucher(),
            error: () => executeVoucher(),
          });
        } else {
          executeVoucher();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Ocurrio un error al crear el cliente.');
      },
    });
  }
}
