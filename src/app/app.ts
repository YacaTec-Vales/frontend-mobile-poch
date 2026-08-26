import { Component, signal, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { AuthService } from './core/services/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  protected readonly title = signal('frontend-mobile-poch');
  isLoginPage = false;
  isMobile = true; // default a true para evitar parpadeos

  private destroyed = new Subject<void>();
  private mobileQuery = '(max-width: 767px)';

  constructor(
    private router: Router,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = this.router.url.includes('/login');
      }
    });
  }

  ngOnInit(): void {
    this.breakpointObserver
      .observe([this.mobileQuery])
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        this.isMobile = this.breakpointObserver.isMatched(this.mobileQuery);
      });
  }

  ngAfterViewInit(): void {
    initFlowbite();
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
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
