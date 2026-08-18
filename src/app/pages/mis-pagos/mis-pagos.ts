import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';

@Component({
  selector: 'app-mis-pagos',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  templateUrl: './mis-pagos.html',
  styleUrl: './mis-pagos.css',
})
export class MisPagos {}
