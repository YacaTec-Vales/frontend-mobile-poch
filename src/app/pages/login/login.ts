import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import QRCode from 'qrcode';
import type { ApiErrorResponse } from '../../core/types/api-response.types';
import type { LoginDto } from '../../core/types/auth.types';

/** Mapeo de códigos de error del backend a mensajes para el usuario. */
const ERROR_MESSAGES: Record<string, string> = {
  'AUTH.INVALID_CREDENTIALS': 'Usuario o contraseña incorrectos.',
  'AUTH.USER_INACTIVE': 'Tu cuenta está desactivada. Contacta al administrador.',
  'AUTH.LOCKED': 'Tu cuenta ha sido bloqueada temporalmente por demasiados intentos fallidos.',
  'AUTH.PASSWORD_NOT_SET': 'No tienes contraseña configurada. Contacta al administrador.',
};

type LoginStep = 'login' | 'change_password' | 'mfa_setup' | 'mfa_verify';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  step = signal<LoginStep>('login');

  // Login variables
  usernameOrEmail = '';
  password = '';
  rememberMe = false;

  // Change password variables
  newPassword = '';
  confirmPassword = '';

  // MFA variables
  mfaCode = '';
  partialToken = '';
  qrCodeUrl = '';

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  onSubmit(e: Event): void {
    e.preventDefault();
    this.errorMessage.set('');

    if (this.step() === 'mfa_verify') {
      this.submitMfa();
      return;
    }
    if (this.step() === 'mfa_setup') {
      this.submitSetupMfa();
      return;
    }
    if (this.step() === 'change_password') {
      this.submitChangePassword();
      return;
    }

    if (!this.usernameOrEmail.trim() || !this.password.trim()) {
      this.errorMessage.set('Ingresa tu usuario/email y contraseña.');
      return;
    }

    this.isLoading.set(true);
    const dto: LoginDto = {
      usernameOrEmail: this.usernameOrEmail.trim(),
      password: this.password,
      rememberMe: this.rememberMe,
    };

    this.authService.login(dto).subscribe({
      next: (response: any) => {
        const data = response.data || {};
        this.isLoading.set(false);
        this.errorMessage.set('');

        const user = data.user || {};

        // Guardar el token temporal o completo para usarlo en los siguientes pasos
        this.partialToken = data.mfaToken || data.accessToken || '';

        if (user.mustChangePassword) {
          this.step.set('change_password');
        } else if (user.mfaEnabled === false) {
          this.startMfaSetup();
        } else if (data.mfaRequired === true) {
          this.step.set('mfa_verify');
        } else {
          // Login normal
          this.authService.saveSession(response.data);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.handleLoginError(err);
      },
    });
  }

  submitChangePassword(): void {
    this.errorMessage.set('');
    
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage.set('Ingresa la nueva contraseña en ambos campos.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }
    if (this.newPassword.length < 8) {
      this.errorMessage.set('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    this.isLoading.set(true);
    
    const dto = {
      currentPassword: this.password,
      newPassword: this.newPassword
    };

    this.authService.changePassword(dto, this.partialToken).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        // Si el backend devuelve un nuevo token tras el cambio de password, lo actualizamos
        if (res.data?.accessToken) {
          this.partialToken = res.data.accessToken;
        }

        // Después de cambiar el password, ¿necesita MFA?
        // Asumimos que si no lo tenía habilitado, lo necesitamos forzar.
        // Si no tenemos la bandera exacta aquí, lo ideal es siempre intentar verificar o que el backend lo devuelva.
        // Por la guía: evaluamos si necesita MFA.
        // En nuestro caso, como es un login nuevo y la guía manda a forzar MFA, vamos a setup.
        // En una app real, si el backend no nos dice si necesita MFA después del cambio, lo asumimos por diseño.
        this.startMfaSetup();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Ocurrió un error al cambiar la contraseña.');
      }
    });
  }

  startMfaSetup(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.authService.setupMfa(this.partialToken).subscribe({
      next: async (response: any) => {
        this.isLoading.set(false);
        const otpauthUrl = response.data.otpauthUrl || response.data.qrCodeUrl;
        
        try {
          if (otpauthUrl && otpauthUrl.startsWith('otpauth://')) {
            this.qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
          } else {
            this.qrCodeUrl = otpauthUrl;
          }
        } catch (err) {
          console.error('Error al generar QR:', err);
          this.qrCodeUrl = '';
        }
        
        this.step.set('mfa_setup');
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No se pudo generar el código QR para MFA.');
      }
    });
  }

  submitSetupMfa(): void {
    this.errorMessage.set('');
    if (!this.mfaCode.trim() || this.mfaCode.length < 6) {
      this.errorMessage.set('Ingresa el código de 6 dígitos de tu aplicación.');
      return;
    }

    this.isLoading.set(true);
    this.authService.verifySetupMfa(this.mfaCode.trim(), this.partialToken).subscribe({
      next: (response) => {
        this.authService.saveSession(response.data);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 400 || err.status === 401) {
          this.errorMessage.set('Código MFA inválido.');
        } else {
          this.errorMessage.set('Ocurrió un error al configurar el MFA.');
        }
      },
    });
  }

  submitMfa(): void {
    this.errorMessage.set('');
    if (!this.mfaCode.trim() || this.mfaCode.length < 6) {
      this.errorMessage.set('Ingresa un código MFA válido de al menos 6 caracteres.');
      return;
    }
    this.isLoading.set(true);
    this.authService.verifyMfa(this.mfaCode.trim(), this.partialToken).subscribe({
      next: (response) => {
        this.authService.saveSession(response.data);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 400 || err.status === 401) {
          this.errorMessage.set('Código MFA inválido o expirado.');
        } else {
          this.errorMessage.set('Ocurrió un error al verificar el MFA.');
        }
      },
    });
  }

  private handleLoginError(err: HttpErrorResponse): void {
    if (err.status === 401 || err.status === 403 || err.status === 400) {
      const errorData = err.error as ApiErrorResponse;
      if (errorData?.error?.code) {
        const msg = ERROR_MESSAGES[errorData.error.code];
        this.errorMessage.set(msg || errorData.message || 'Error de autenticación.');
        return;
      }
    }
    this.errorMessage.set('Ocurrió un error de conexión al servidor.');
  }
}
