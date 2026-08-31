import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

/** Rutas que no deben disparar el flujo de auto-refresh. */
const SKIP_REFRESH_PATHS = ['/auth/login', '/auth/refresh'];

/**
 * Estado compartido para coordinar refresh concurrente.
 * Se declara fuera del interceptor para que todas las invocaciones
 * compartan la misma referencia (singleton por módulo).
 */
let isRefreshing = false;
const refreshSubject$ = new BehaviorSubject<string | null>(null);

/**
 * Interceptor funcional que maneja errores HTTP globales.
 *
 * Flujo ante un 401:
 * 1. Si la petición es pública (/auth/login, /auth/refresh) → dejar pasar el error.
 * 2. Si NO hay refresh en progreso → iniciar refresh, encolar peticiones.
 * 3. Si YA hay refresh en progreso → esperar a que termine y reintentar.
 * 4. Si el refresh falla → limpiar sesión y redirigir a /login.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo manejar 401 en rutas protegidas
      if (
        error.status !== 401 ||
        SKIP_REFRESH_PATHS.some((path) => req.url.includes(path))
      ) {
        // FASE A: traducir AUTH.ORIGIN_NOT_ALLOWED (403) a mensaje claro.
        if (error.status === 403) {
          const originalCode =
            error.error?.code ?? error.error?.error?.code ?? null;
          if (originalCode === 'AUTH.ORIGIN_NOT_ALLOWED') {
            const details =
              error.error?.details ?? error.error?.error?.details;
            const allowed =
              details?.allowedOrigins?.join(' o ') ?? 'red privada';
            const translated = new HttpErrorResponse({
              error: {
                message: `Esta cuenta solo puede iniciar sesion desde ${allowed}. Si necesitas entrar como administrador, abre vpn.taquizaschavez.com.mx.`,
                code: originalCode,
                data: details,
              },
              headers: error.headers,
              status: error.status,
              statusText: error.statusText,
              url: error.url || undefined,
            });
            return throwError(() => translated);
          }
        }
        return throwError(() => error);
      }

      // --- 401 en ruta protegida ---

      if (!isRefreshing) {
        // Primera petición que falla: iniciar refresh
        isRefreshing = true;
        refreshSubject$.next(null); // bloquear peticiones encoladas

        return authService.refresh().pipe(
          switchMap((response) => {
            // Refresh exitoso: guardar nuevos tokens
            const { accessToken, refreshToken } = response.data;
            tokenStorage.saveTokens(accessToken, refreshToken);

            isRefreshing = false;
            refreshSubject$.next(accessToken); // desbloquear cola

            // Reintentar la petición original con el nuevo token
            const retryReq = req.clone({
              headers: req.headers.set(
                'Authorization',
                `Bearer ${accessToken}`,
              ),
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Refresh falló: sesión irrecuperable
            isRefreshing = false;
            refreshSubject$.next(null);
            authService.clearSession();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
      }

      // Ya hay refresh en progreso: esperar a que termine
      return refreshSubject$.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((newToken) => {
          const retryReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${newToken}`),
          });
          return next(retryReq);
        }),
      );
    }),
  );
};
