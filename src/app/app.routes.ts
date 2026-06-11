import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginPage),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'consultas',
        loadComponent: () =>
          import('./pages/consultas/consultas').then(m => m.ConsultasComponent),
      },
      {
        path: 'pacientes',
        loadComponent: () =>
          import('./pages/pacientes/pacientes').then(m => m.PacientesComponent),
      },
      {
        path: 'dentistas',
        loadComponent: () =>
          import('./pages/dentistas/dentistas').then(m => m.DentistasComponent),
      },
      {
        path: 'especialidades',
        loadComponent: () =>
          import('./pages/especialidades/especialidades').then(m => m.EspecialidadesComponent),
      },
      {
        path: 'procedimentos',
        loadComponent: () =>
          import('./pages/procedimentos/procedimentos').then(m => m.ProcedimentosComponent),
      },
      {
        path: 'relatorios',
        loadComponent: () =>
          import('./pages/relatorios/relatorios').then(m => m.RelatoriosComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios').then(m => m.UsuariosComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
