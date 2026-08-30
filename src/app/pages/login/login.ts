import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import QRCode from 'qrcode';
import type { ApiErrorResponse } from '../../core/types/api-response.types';
import type { LoginDto } from '../../core/types/auth.types';
import {
  validateEmail,
  validatePassword,
  validatePasswordsMatch,
  validateMfaCode,
  validateUsername,
} from '../../core/validators/form-validators';

/** Mapeo de códigos de error del backend a mensajes para el usuario. */
const ERROR_MESSAGES: Record<string, string> = {
  'AUTH.INVALID_CREDENTIALS': 'Usuario o contraseña incorrectos.',
  'AUTH.USER_INACTIVE': 'Tu cuenta está desactivada. Contacta al administrador.',
  'AUTH.LOCKED': 'Tu cuenta ha sido bloqueada temporalmente por demasiados intentos fallidos.',
  'AUTH.PASSWORD_NOT_SET': 'No tienes contraseña configurada. Contacta al administrador.',
};

type LoginStep = 'login' | 'change_password' | 'mfa_setup' | 'mfa_verify';

/**
 * Detecta si el valor es email (contiene @ y dominio) o username
 * (alfanumerico + guion bajo/punto).
 */
function isEmailLike(v: string): boolean {
  return v.includes('@');
}

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

  /** Tocado: el usuario interactuo con el campo (se valida en submit). */
  readonly submitted = signal(false);

  /** Indica si mostrar errores por campo (true despues del primer submit). */
  private readonly showFieldErrors = computed(() => this.submitted());

  // Errores por campo (computed para que se actualicen al cambiar el input)
  readonly usernameOrEmailError = computed(() => {
    if (!this.showFieldErrors()) return '';
    const v = this.usernameOrEmail;
    if (!v || !v.trim()) return 'Ingresa tu usuario o correo electronico.';
    if (v.length > 254) return 'El usuario/correo es demasiado largo.';
    // Acepta username o email; valida segun corresponda
    if (isEmailLike(v)) {
      return validateEmail(v);
    }
    return validateUsername(v);
  });

  readonly passwordError = computed(() => {
    if (!this.showFieldErrors()) return '';
    if (!this.password) return 'Ingresa tu contrasena.';
    if (this.password.length < 8) {
      return 'La contrasena debe tener al menos 8 caracteres.';
    }
    return '';
  });

  readonly newPasswordError = computed(() => {
    if (!this.showFieldErrors()) return '';
    if (!this.newPassword) return 'Ingresa la nueva contrasena.';
    return validatePassword(this.newPassword);
  });

  readonly confirmPasswordError = computed(() => {
    if (!this.showFieldErrors()) return '';
    if (!this.confirmPassword) return 'Confirma la nueva contrasena.';
    return validatePasswordsMatch(this.newPassword, this.confirmPassword);
  });

  readonly mfaCodeError = computed(() => {
    if (!this.showFieldErrors()) return '';
    return validateMfaCode(this.mfaCode);
  });

  /**
   * Habilita el boton submit solo si los campos del step actual
   * son validos. Esto evita llamadas innecesarias al backend.
   */
  readonly canSubmit = computed(() => {
    const s = this.step();
    if (s === 'login') {
      return (
        this.usernameOrEmail.trim().length > 0 &&
        this.password.length >= 8 &&
        !(this.usernameOrEmailError() || this.passwordError())
      );
    }
    if (s === 'change_password') {
      return (
        !this.newPasswordError() &&
        !this.confirmPasswordError() &&
        this.newPassword.length > 0 &&
        this.confirmPassword.length > 0
      );
    }
    if (s === 'mfa_setup' || s === 'mfa_verify') {
      return !this.mfaCodeError() && this.mfaCode.length > 0;
    }
    return false;
  });

  onSubmit(e: Event): void {
    e.preventDefault();
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.step() === 'mfa_verify') {
      if (this.mfaCodeError()) return;
      this.submitMfa();
      return;
    }
    if (this.step() === 'mfa_setup') {
      if (this.mfaCodeError()) return;
      this.submitSetupMfa();
      return;
    }
    if (this.step() === 'change_password') {
      if (this.newPasswordError() || this.confirmPasswordError()) return;
      this.submitChangePassword();
      return;
    }

    if (this.usernameOrEmailError() || this.passwordError()) {
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

        this.partialToken = data.mfaToken || data.accessToken || '';

        if (user.mustChangePassword) {
          this.step.set('change_password');
          this.submitted.set(false); // reset para nuevos campos
        } else if (user.mfaEnabled === false) {
          this.startMfaSetup();
        } else if (data.mfaRequired === true) {
          this.step.set('mfa_verify');
          this.submitted.set(false);
        } else {
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

    if (this.newPasswordError() || this.confirmPasswordError()) {
      return;
    }

    this.isLoading.set(true);

    const dto = {
      currentPassword: this.password,
      newPassword: this.newPassword,
    };

    this.authService.changePassword(dto, this.partialToken).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if (res.data?.accessToken) {
          this.partialToken = res.data.accessToken;
        }
        this.startMfaSetup();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || 'Ocurrio un error al cambiar la contrasena.',
        );
      },
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
        this.submitted.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No se pudo generar el codigo QR para MFA.');
      },
    });
  }

  submitSetupMfa(): void {
    this.errorMessage.set('');
    if (this.mfaCodeError()) return;

    this.isLoading.set(true);
    this.authService.verifySetupMfa(this.mfaCode.trim(), this.partialToken).subscribe({
      next: (response) => {
        this.authService.saveSession(response.data);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 400 || err.status === 401) {
          this.errorMessage.set('Codigo MFA invalido.');
        } else {
          this.errorMessage.set('Ocurrio un error al configurar el MFA.');
        }
      },
    });
  }

  submitMfa(): void {
    this.errorMessage.set('');
    if (this.mfaCodeError()) return;

    this.isLoading.set(true);
    this.authService.verifyMfa(this.mfaCode.trim(), this.partialToken).subscribe({
      next: (response) => {
        this.authService.saveSession(response.data);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 400 || err.status === 401) {
          this.errorMessage.set('Codigo MFA invalido o expirado.');
        } else {
          this.errorMessage.set('Ocurrio un error al verificar el MFA.');
        }
      },
    });
  }

  private handleLoginError(err: HttpErrorResponse): void {
    if (err.status === 401 || err.status === 403 || err.status === 400) {
      const errorData = err.error as ApiErrorResponse;
      if (errorData?.error?.code) {
        const msg = ERROR_MESSAGES[errorData.error.code];
        this.errorMessage.set(msg || errorData.message || 'Error de autenticacion.');
        return;
      }
    }
    this.errorMessage.set('Ocurrio un error de conexion al servidor.');
  }
}
