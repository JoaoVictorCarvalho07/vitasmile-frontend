import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from './toast.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const token = auth.getToken();
  console.log('[JWT Interceptor] URL:', req.url);
  console.log('[JWT Interceptor] Token:', token);

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err) => {
      if (err.status === 0) {
        toast.erro(
          'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        );
        return EMPTY;
      }
      const tokenExpirado = err.status === 401 && err.headers?.get('X-Token-Expired') === 'true';
      if (tokenExpirado) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
