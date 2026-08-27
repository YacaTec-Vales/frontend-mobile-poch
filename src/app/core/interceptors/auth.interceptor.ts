import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

/** Rutas que no necesitan Authorization header. */
const PUBLIC_PATHS = ['/auth/login', '/auth/refresh'];

/**
 * Interceptor funcional que inyecta el header Authorization: Bearer <token>
 * en todas las peticiones excepto las rutas públicas.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getAccessToken();

  const isPublic = PUBLIC_PATHS.some((path) => req.url.includes(path));

  let headers = req.headers;

  // Solo inyectar Poch si el servicio no especificó otra app (como MFA que necesita Tecu)
  if (!headers.has('x-client-app')) {
    headers = headers.set('x-client-app', 'Poch');
  }
  
  if (!headers.has('X-Origin')) {
    headers = headers.set('X-Origin', 'vpn');
  }

  if (token && !isPublic) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const cloned = req.clone({ headers });
  return next(cloned);
};
