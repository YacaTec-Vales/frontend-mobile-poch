import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { NuevoCliente } from './pages/nuevo-cliente/nuevo-cliente';
import { ValeDigital } from './pages/vale-digital/vale-digital';
import { MiCartera } from './pages/mi-cartera/mi-cartera';
import { Transferencias } from './pages/transferencias/transferencias';
import { MisPagos } from './pages/mis-pagos/mis-pagos';
import { Reclamos } from './pages/reclamos/reclamos';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'nuevo-cliente', component: NuevoCliente },
  { path: 'vale-digital', component: ValeDigital },
  { path: 'mi-cartera', component: MiCartera },
  { path: 'transferencias', component: Transferencias },
  { path: 'mis-pagos', component: MisPagos },
  { path: 'reclamos', component: Reclamos },
];
