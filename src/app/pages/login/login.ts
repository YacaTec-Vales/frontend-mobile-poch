import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import type { ApiErrorResponse } from '../../core/types/api-response.types';
import type { LoginDto } from '../../core/types/auth.types';

/** Mapeo de códigos de error del backend a mensajes para el usuario. */
const ERROR_MESSAGES: Record<string, string> = {
  'AUTH.INVALID_CREDENTIALS': 'Usuario o contraseña incorrectos.',
  'AUTH.USER_INACTIVE': 'Tu cuenta está desactivada. Contacta al administrador.',
  'AUTH.LOCKED': 'Tu cuenta ha sido bloqueada temporalmente por demasiados intentos fallidos.',
  'AUTH.PASSWORD_NOT_SET': 'No tienes contraseña configurada. Contacta al administrador.',
};

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  usernameOrEmail = '';
  password = '';
  rememberMe = false;

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  onSubmit(e: Event): void {
    e.preventDefault();
    this.errorMessage.set('');

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
      next: (response) => {
        this.authService.saveSession(response.data);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.handleLoginError(err);
      },
    });
  }

  private handleLoginError(err: HttpErrorResponse): void {
    const body = err.error as ApiErrorResponse | undefined;
    const code = body?.error?.code;

    if (code && ERROR_MESSAGES[code]) {
      this.errorMessage.set(ERROR_MESSAGES[code]);
    } else if (body?.message) {
      this.errorMessage.set(body.message);
    } else if (err.status === 0) {
      this.errorMessage.set('No se pudo conectar al servidor. Verifica tu conexión a internet.');
    } else {
      this.errorMessage.set('Ocurrió un error inesperado. Intenta de nuevo.');
    }
  }
}

