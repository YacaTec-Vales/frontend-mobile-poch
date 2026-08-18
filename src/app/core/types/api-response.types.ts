/**
 * Contrato estándar de respuesta de la API.
 * data y error son mutuamente excluyentes.
 *
 * @see respuestas-api.md del backend
 */

export interface ApiSuccessResponse<T> {
  message: string;
  data: T;
}

export interface ApiErrorDetail {
  code: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  message: string;
  error: ApiErrorDetail;
}
