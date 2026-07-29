import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';

@Component({
  selector: 'app-reclamos',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  templateUrl: './reclamos.html'
})
export class Reclamos {
}
