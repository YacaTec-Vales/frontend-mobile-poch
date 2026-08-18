import { Component, signal, OnInit, AfterViewInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, AfterViewInit {
  protected readonly title = signal('frontend-mobile-poch');
  isLoginPage = false;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = this.router.url.includes('/login');
      }
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    initFlowbite();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        // Si la petición al servidor falla, limpiar sesión local de todas formas
        this.authService.clearSession();
        this.router.navigate(['/login']);
      },
    });
  }
}
