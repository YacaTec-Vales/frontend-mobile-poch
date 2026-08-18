import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../components/ui/card/card';
import { SearchBarComponent } from '../../components/ui/search-bar/search-bar';
import { ButtonComponent } from '../../components/ui/button/button';
import { InputComponent } from '../../components/ui/input/input';

@Component({
  selector: 'app-vale-digital',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, SearchBarComponent, ButtonComponent, InputComponent],
  templateUrl: './vale-digital.html',
  styleUrl: './vale-digital.css',
})
export class ValeDigital {
  monto: number = 1000;
  limiteDisponible: number = 4500;
  limitePermitido: number = 2250; 
}
