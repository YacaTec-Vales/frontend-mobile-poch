export const environment = {
  production: false,
  // Dev: usa el proxy de Angular (proxy.conf.json) que redirige /api/*
  // al backend de staging en infra (api.taquizaschavez.com.mx) o al backend
  // dev en casa (utete.ddns.net:45000) segun el proxy.conf.json del proyecto.
  apiUrl: '/api/v1'
};

