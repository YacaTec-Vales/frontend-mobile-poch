import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { timer } from 'rxjs';
import * as QRCode from 'qrcode';
import { CardComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { MfaService } from '../../core/services/mfa.service';

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  templateUrl: './mfa-setup.html'
})
export class MfaSetup implements OnInit {
  private readonly mfaService = inject(MfaService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  qrCodeDataUrl = signal('');
  backupCodes = signal<string[]>([]);
  mfaCode = '';

  isVerifying = signal(false);

  ngOnInit() {
    this.startSetup();
  }

  startSetup() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.mfaService.setupMfa().subscribe({
      next: async (res) => {
        this.backupCodes.set(res.data.backupCodes);
        try {
          const dataUrl = await QRCode.toDataURL(res.data.otpauthUrl, {
            width: 250,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
          });
          this.qrCodeDataUrl.set(dataUrl);
        } catch (e) {
          this.errorMessage.set('Error al generar el código QR visual.');
        }
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'No se pudo iniciar la configuración de MFA.');
      }
    });
  }

  verifyCode() {
    this.errorMessage.set('');
    if (!this.mfaCode || this.mfaCode.length < 6) {
      this.errorMessage.set('Ingresa el código de 6 dígitos.');
      return;
    }

    this.isVerifying.set(true);
    this.mfaService.verifySetup(this.mfaCode.trim()).subscribe({
      next: () => {
        this.isVerifying.set(false);
        this.successMessage.set('Autenticador configurado correctamente.');
        // BUG FIX 2026-08-31: takeUntilDestroyed cancela el redirect si el
        // componente se destruye antes de los 2s.
        timer(2000)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.router.navigate(['/dashboard']));
      },
      error: (err: HttpErrorResponse) => {
        this.isVerifying.set(false);
        this.errorMessage.set(err.error?.message || 'Código inválido o expirado.');
      }
    });
  }

  copyCodes() {
    const codes = this.backupCodes().join('\n');
    navigator.clipboard.writeText(codes);
    alert('Códigos copiados al portapapeles. ¡Guárdalos en un lugar seguro!');
  }
}
