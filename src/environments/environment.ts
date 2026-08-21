export const environment = {
  production: true,
  // Produccion (infra): apunta a api.taquizaschavez.com.mx que via Cloudflare
  // llega a lb-01 -> backend_public (app-02/app-03 backup).
  // apiv2.taquizaschavez.com.mx es la API de DESARROLLO (casa) y NUNCA debe
  // usarse en produccion.
  apiUrl: 'https://api.taquizaschavez.com.mx/api/v1'
};

