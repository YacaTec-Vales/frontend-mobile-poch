import {
  Component,
  signal,
  OnInit,
  AfterViewInit,
  OnDestroy,
  inject,
  effect,
} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { AuthService } from './core/services/auth.service';

const MOBILE_QUERY = '(max-width: 767px)';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  protected readonly title = signal('frontend-mobile-poch');
  isLoginPage = false;
  isMobile = signal(true);

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private mql?: MediaQueryList;

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = this.router.url.includes('/login');
      }
    });

    effect(() => {
      this.isMobile();
    });
  }

  ngOnInit(): void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    this.mql = window.matchMedia(MOBILE_QUERY);
    this.isMobile.set(this.mql.matches);

    const handler = (event: MediaQueryListEvent) => {
      this.isMobile.set(event.matches);
    };

    if (this.mql.addEventListener) {
      this.mql.addEventListener('change', handler);
    } else {
      this.mql.addListener(handler);
    }
  }

  ngAfterViewInit(): void {
    initFlowbite();
  }

  ngOnDestroy(): void {
    if (this.mql) {
      if (this.mql.removeEventListener) {
        this.mql.removeEventListener('change', () => {});
      } else {
        this.mql.removeListener(() => {});
      }
    }
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      },
    });
  }
}