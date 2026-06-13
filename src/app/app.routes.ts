import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth.guard';
import { AuthService } from './services/auth.service';

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
        canActivate: [roleGuard(['ADMIN', 'DENTISTA'])],
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
        canActivate: [roleGuard(['ADMIN', 'DENTISTA'])],
        loadComponent: () =>
          import('./pages/pacientes/pacientes').then(m => m.PacientesComponent),
      },
      {
        path: 'dentistas',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./pages/dentistas/dentistas').then(m => m.DentistasComponent),
      },
      {
        path: 'especialidades',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./pages/especialidades/especialidades').then(m => m.EspecialidadesComponent),
      },
      {
        path: 'procedimentos',
        loadComponent: () =>
          import('./pages/procedimentos/procedimentos').then(m => m.ProcedimentosComponent),
      },
      {
        path: 'contato',
        loadComponent: () =>
          import('./pages/contato/contato').then(m => m.ContatoComponent),
      },
      {
        path: 'relatorios',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./pages/relatorios/relatorios').then(m => m.RelatoriosComponent),
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./pages/usuarios/usuarios').then(m => m.UsuariosComponent),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: () => (inject(AuthService).isPaciente() ? 'consultas' : 'dashboard'),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
