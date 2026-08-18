import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { NuevoCliente } from './pages/nuevo-cliente/nuevo-cliente';
import { ValeDigital } from './pages/vale-digital/vale-digital';
import { MiCartera } from './pages/mi-cartera/mi-cartera';
import { Transferencias } from './pages/transferencias/transferencias';
import { MisPagos } from './pages/mis-pagos/mis-pagos';
import { Reclamos } from './pages/reclamos/reclamos';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'nuevo-cliente', component: NuevoCliente, canActivate: [authGuard] },
  { path: 'vale-digital', component: ValeDigital, canActivate: [authGuard] },
  { path: 'mi-cartera', component: MiCartera, canActivate: [authGuard] },
  { path: 'transferencias', component: Transferencias, canActivate: [authGuard] },
  { path: 'mis-pagos', component: MisPagos, canActivate: [authGuard] },
  { path: 'reclamos', component: Reclamos, canActivate: [authGuard] },
];

