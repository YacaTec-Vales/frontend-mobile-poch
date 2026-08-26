import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional que protege rutas autenticadas.
 *
 * - Si no hay token → redirige a /login inmediatamente.
 * - Si hay token → llama a GET /auth/me para revalidar la sesión.
 *   - Si responde bien → actualiza datos del usuario en storage y permite acceso.
 *   - Si falla → el errorInterceptor intentará refresh automáticamente.
 *     Si el refresh también falla, el interceptor redirige a /login.
 */
export const authGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!tokenStorage.hasToken()) {
    return router.createUrlTree(['/login']);
  }

  // Revalidar sesión contra el servidor
  return authService.getMe().pipe(
    map((response) => {
      // Actualizar datos del usuario en storage
      const user = response.data;
      tokenStorage.saveUser(user);
      return true;
    }),
    catchError(() => {
      // Si llegamos aquí, el interceptor ya intentó refresh y falló.
      // Limpiamos sesión por seguridad.
      authService.clearSession();
      return of(router.createUrlTree(['/login']));
    }),
  );
};
