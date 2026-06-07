import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  constructor(private auth: AuthService, private router: Router) {}

  get isAdmin(): boolean {
    return this.auth.getPerfil() === 'ADMIN';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
