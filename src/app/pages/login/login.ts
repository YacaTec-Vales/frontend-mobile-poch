import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html'
})
export class Login {
  email = '';
  password = '';

  constructor(private router: Router) {}

  onSubmit(e: Event) {
    e.preventDefault();
    this.router.navigate(['/dashboard']);
  }
}
